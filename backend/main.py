from typing import Optional
import json
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response
# import asyncpg
import psycopg2

app = FastAPI()

DATABASE_URL = "postgresql://postgres:password@localhost:5432/pdfstore"

def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.get("/hello")
async def hello():
    return {"message": "world"}

@app.post("/upload-pdf/")
async def upload_pdf(
        file: UploadFile = File(...),
        description: Optional[str] = None
):
    """Upload PDF file to PostgreSQL database"""

    print("before validate")
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="File must be a PDF"
        )

    # Optional: Check file size (e.g., max 50MB)
    max_size = 50 * 1024 * 1024  # 50MB in bytes
    content = await file.read()
    file_size = len(content)

    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 50MB"
        )

    # Reset file pointer
    await file.seek(0)

    print("file_seek succeeded")

    try:
        print("attempting connection")
        print("sync psycopg2 connection")
        conn = get_db_connection()
        print("connection succeeded")

        # Prepare metadata
        metadata = {
            "description": description,
            "original_filename": file.filename,
            "upload_timestamp": datetime.utcnow().isoformat()
        }

        # Insert PDF into database
        query = """
                INSERT INTO pdf_files (filename, content_type, file_size, file_data, metadata)
                VALUES ($1, $2, $3, $4, $5) RETURNING id, uploaded_at \
                """

        result = await conn.fetchrow(
            query,
            file.filename,
            file.content_type,
            file_size,
            content,
            json.dumps(metadata)
        )

        await conn.close()

        return JSONResponse({
            "message": "PDF uploaded successfully",
            "file_id": result["id"],
            "filename": file.filename,
            "size": file_size,
            "uploaded_at": result["uploaded_at"].isoformat()
        })

    except Exception as e:
        if 'conn' in locals():
            await conn.close()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving PDF to database: {str(e)}"
        )


@app.get("/pdf/{file_id}")
async def get_pdf(file_id: int):
    """Retrieve PDF file from database"""

    try:
        conn = await get_db_connection()

        query = """
                SELECT filename, content_type, file_data, file_size, metadata
                FROM pdf_files
                WHERE id = $1 \
                """

        result = await conn.fetchrow(query, file_id)
        await conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="PDF not found")

        return Response(
            content=result["file_data"],
            media_type=result["content_type"],
            headers={
                "Content-Disposition": f"attachment; filename={result['filename']}",
                "Content-Length": str(result["file_size"])
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        if 'conn' in locals():
            await conn.close()
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving PDF: {str(e)}"
        )


@app.get("/pdfs/")
async def list_pdfs(limit: int = 10, offset: int = 0):
    """List all uploaded PDFs with metadata"""

    try:
        conn = await get_db_connection()

        query = """
                SELECT id, filename, content_type, file_size, uploaded_at, metadata
                FROM pdf_files
                ORDER BY uploaded_at DESC
                    LIMIT $1 \
                OFFSET $2 \
                """

        results = await conn.fetch(query, limit, offset)

        # Get total count
        count_query = "SELECT COUNT(*) FROM pdf_files"
        total_count = await conn.fetchval(count_query)

        await conn.close()

        pdfs = []
        for row in results:
            pdf_info = {
                "id": row["id"],
                "filename": row["filename"],
                "content_type": row["content_type"],
                "file_size": row["file_size"],
                "uploaded_at": row["uploaded_at"].isoformat(),
                "metadata": json.loads(row["metadata"]) if row["metadata"] else {}
            }
            pdfs.append(pdf_info)

        return JSONResponse({
            "pdfs": pdfs,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        })

    except Exception as e:
        if 'conn' in locals():
            await conn.close()
        raise HTTPException(
            status_code=500,
            detail=f"Error listing PDFs: {str(e)}"
        )


@app.delete("/pdf/{file_id}")
async def delete_pdf(file_id: int):
    """Delete PDF from database"""

    try:
        conn = await get_db_connection()

        query = "DELETE FROM pdf_files WHERE id = $1 RETURNING filename"
        result = await conn.fetchrow(query, file_id)

        await conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="PDF not found")

        return JSONResponse({
            "message": "PDF deleted successfully",
            "filename": result["filename"]
        })

    except HTTPException:
        raise
    except Exception as e:
        if 'conn' in locals():
            await conn.close()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting PDF: {str(e)}"
        )

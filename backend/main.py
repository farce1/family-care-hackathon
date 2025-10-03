from typing import Optional
import json
import os
from datetime import datetime

from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response
import asyncpg
from uuid import uuid4, UUID

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pdfstore")

class PDFResponse(BaseModel):
    id: UUID
    filename: str
    file_size: int
    file_data: bytes


async def get_db_connection():
    """Create database connection"""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.get("/hello")
async def hello():
    return {"message": "world"}

@app.post("/upload-pdf/", response_model=PDFResponse)
async def upload_pdf(
        file: UploadFile = File(...),
):
    """Upload PDF file to PostgreSQL database"""

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

    try:
        conn = await get_db_connection()

        pdf_id = uuid4()

        # Insert PDF with user association
        result = await conn.fetchrow(
            """
            INSERT INTO pdfs (id, filename, file_size, file_data)
            VALUES ($1, $2, $3, $4) RETURNING id
            """,
            pdf_id,
            file.filename,
            file_size,
            content,  # asyncpg handles binary data automatically
        )

        return PDFResponse(
            id=pdf_id,
            filename=file.filename,
            file_size=file_size,
            file_data=content,
        )

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
        print("trying connection")
        conn = await get_db_connection()
        print("connected")

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
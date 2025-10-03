// TypeScript request for NFZ (Polish National Health Fund) API

interface NFZQueueParams {
  page?: number;
  limit?: number;
  format?: 'json' | 'xml';
  case?: number;
  province?: string;
  benefit?: string;
  benefitForChildren?: boolean;
  apiVersion?: string;
}

interface NFZQueueResponse {
  // Define the response structure based on your API documentation
  // This is a placeholder - update with actual response structure
  data?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

async function getNFZQueues(params: NFZQueueParams = {}): Promise<NFZQueueResponse> {
  const baseUrl = 'https://api.nfz.gov.pl/app-itl-api/queues';
  
  // Default parameters matching your curl request
  const defaultParams: NFZQueueParams = {
    page: 1,
    limit: 1,
    format: 'json',
    case: 1,
    province: '01',
    benefit: 'PORADNIA ALERGOLOGICZNA',
    benefitForChildren: false,
    apiVersion: '1.3'
  };
  
  // Merge with provided params
  const finalParams = { ...defaultParams, ...params };
  
  // Build URL with search parameters
  const url = new URL(baseUrl);
  
  if (finalParams.page) url.searchParams.append('page', finalParams.page.toString());
  if (finalParams.limit) url.searchParams.append('limit', finalParams.limit.toString());
  if (finalParams.format) url.searchParams.append('format', finalParams.format);
  if (finalParams.case) url.searchParams.append('case', finalParams.case.toString());
  if (finalParams.province) url.searchParams.append('province', finalParams.province);
  if (finalParams.benefit) url.searchParams.append('benefit', finalParams.benefit);
  if (finalParams.benefitForChildren !== undefined) {
    url.searchParams.append('benefitForChildren', finalParams.benefitForChildren.toString());
  }
  if (finalParams.apiVersion) url.searchParams.append('api-version', finalParams.apiVersion);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching NFZ queue data:', error);
    throw error;
  }
}

// For use in a React component or similar:
export { getNFZQueues, type NFZQueueParams, type NFZQueueResponse };

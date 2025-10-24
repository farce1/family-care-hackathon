// Corrected TypeScript function based on actual NFZ API response

interface NFZQueueParams {
  page?: number;
  limit?: number;
  format?: "json" | "xml";
  case?: number;
  province?: string;
  benefit?: string;
  benefitForChildren?: boolean;
  apiVersion?: string;
}

// Updated interfaces to match actual API response
interface NFZApiResponse {
  meta: {
    count: number;
    page: number;
    limit: number;
    [key: string]: unknown;
  };
  links: {
    first: string;
    prev: string | null;
    self: string;
    next: string;
    last: string;
  };
  data: NFZQueueItem[];
}

interface NFZQueueItem {
  type: string;
  id: string;
  attributes: {
    case: number;
    benefit: string;
    provider: string;
    place: string;
    address: string;
    locality: string;
    phone: string;
    latitude: number;
    longitude: number;
    dates: {
      applicable: boolean;
      date: string;
      "date-situation-as-at": string;
    };
    statistics: {
      "provider-data": {
        awaiting: number;
        removed: number;
        "average-period": number;
        update: string;
      };
      "computed-data": unknown;
    };
    // Add other fields as needed
    [key: string]: unknown;
  };
}

interface ParsedNFZItem {
  id: string;
  place: string;
  provider: string;
  phone: string;
  address: string;
  locality: string;
  date: string;
  benefit: string;
  averageWaitDays: number;
  latitude: number;
  longitude: number;
}

async function getNFZQueues(params: NFZQueueParams = {}): Promise<ParsedNFZItem[]> {
  const baseUrl = "https://api.nfz.gov.pl/app-itl-api/queues";

  const defaultParams: NFZQueueParams = {
    page: 1,
    limit: 10, // Increased to get more results
    format: "json",
    case: 1,
    province: "01",
    benefit: "PORADNIA ALERGOLOGICZNA",
    benefitForChildren: false,
    apiVersion: "1.3",
  };

  const finalParams = { ...defaultParams, ...params };
  const url = new URL(baseUrl);

  if (finalParams.page) url.searchParams.append("page", finalParams.page.toString());
  if (finalParams.limit) url.searchParams.append("limit", finalParams.limit.toString());
  if (finalParams.format) url.searchParams.append("format", finalParams.format);
  if (finalParams.case) url.searchParams.append("case", finalParams.case.toString());
  if (finalParams.province) url.searchParams.append("province", finalParams.province);
  if (finalParams.benefit) url.searchParams.append("benefit", finalParams.benefit);
  if (finalParams.benefitForChildren !== undefined) {
    url.searchParams.append("benefitForChildren", finalParams.benefitForChildren.toString());
  }
  if (finalParams.apiVersion) url.searchParams.append("api-version", finalParams.apiVersion);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData: NFZApiResponse = await response.json();

    // Safety check
    if (!apiData.data || !Array.isArray(apiData.data)) {
      console.warn("No data found in API response");
      return [];
    }

    const parsedList: ParsedNFZItem[] = [];

    // Updated loop to match actual API structure
    for (let i = 0; i < apiData.data.length; i++) {
      const item = apiData.data[i];
      const attrs = item.attributes; // The actual data is in 'attributes'

      const parsedItem: ParsedNFZItem = {
        id: item.id,
        place: attrs.place || "Unknown place",
        provider: attrs.provider || "Unknown provider",
        phone: attrs.phone || "No phone",
        address: attrs.address || "No address",
        locality: attrs.locality || "Unknown city",
        date: attrs.dates?.date || "No date available",
        benefit: attrs.benefit || "Unknown benefit",
        averageWaitDays: attrs.statistics?.["provider-data"]?.["average-period"] || 0,
        latitude: attrs.latitude || 0,
        longitude: attrs.longitude || 0,
      };

      parsedList.push(parsedItem);
    }

    return parsedList;
  } catch (error) {
    console.error("Error fetching NFZ queue data:", error);
    throw error;
  }
}

// Updated main function to show the new data structure
async function main() {
  console.log("🏥 Testing NFZ API with correct structure...\n");

  try {
    const results = await getNFZQueues({ benefit: "PORADNIA ALERGOLOGICZNA" });

    console.log("✅ API call successful!");
    console.log("📊 Results:");
    console.log("Number of clinics found:", results.length);

    results.forEach((clinic, index) => {
      console.log(`\n--- Clinic ${index + 1} ---`);
      console.log("ID:", clinic.id);
      console.log("Provider:", clinic.provider);
      console.log("Place:", clinic.place);
      console.log("City:", clinic.locality);
      console.log("Address:", clinic.address);
      console.log("Phone:", clinic.phone);
      console.log("Next available:", clinic.date);
      console.log("Average wait (days):", clinic.averageWaitDays);
      console.log("Location:", `${clinic.latitude}, ${clinic.longitude}`);
    });

    console.log("\n🔍 Raw parsed data:");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for use
export { getNFZQueues, type NFZQueueParams, type ParsedNFZItem };

// Run tests
main();

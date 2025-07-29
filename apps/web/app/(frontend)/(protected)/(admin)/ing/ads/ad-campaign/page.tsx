import { getCampaignsDetails } from "@/features/ads/_lib/queries";

export default async function Home() {
  const campaigns = await getCampaignsDetails();

  return <p>Campaign</p>;
}

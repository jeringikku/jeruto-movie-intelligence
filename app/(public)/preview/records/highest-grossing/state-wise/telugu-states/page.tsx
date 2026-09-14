import PublicHeader from "@/app/(public)/components/PublicHeader";
import StateRecordsLanding from "@/app/(public)/components/StateRecordsLanding";

export default function TeluguStatesRecordsPage() {
  return (
    <>
      <PublicHeader />

      <StateRecordsLanding
        marketName="Telugu States"
        marketLabel="TELUGU STATES"
        marketDescription="Explore combined Andhra Pradesh and Telangana theatrical records through overall, non-Telugu and language-wise performances."
        motherLanguage="Telugu"
        slug="telugu-states"
      />
    </>
  );
}
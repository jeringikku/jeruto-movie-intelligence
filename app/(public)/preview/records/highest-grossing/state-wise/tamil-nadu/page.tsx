import PublicHeader from "@/app/(public)/components/PublicHeader";
import StateRecordsLanding from "@/app/(public)/components/StateRecordsLanding";

export default function TamilNaduRecordsPage() {
  return (
    <>
      <PublicHeader />

      <StateRecordsLanding
        marketName="Tamil Nadu"
        marketLabel="TAMIL NADU RECORDS"
        marketDescription="Explore Tamil Nadu's highest-grossing theatrical performances through overall, non-Tamil and language-wise records."
        motherLanguage="Tamil"
        slug="tamil-nadu"
      />
    </>
  );
}
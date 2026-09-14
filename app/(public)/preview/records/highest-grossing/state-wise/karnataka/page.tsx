import PublicHeader from "@/app/(public)/components/PublicHeader";
import StateRecordsLanding from "@/app/(public)/components/StateRecordsLanding";

export default function KarnatakaRecordsPage() {
  return (
    <>
      <PublicHeader />

      <StateRecordsLanding
        marketName="Karnataka"
        marketLabel="KARNATAKA RECORDS"
        marketDescription="Explore Karnataka's highest-grossing theatrical performances through overall, non-Kannada and language-wise records."
        motherLanguage="Kannada"
        slug="karnataka"
      />
    </>
  );
}
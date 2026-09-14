import PublicHeader from "@/app/(public)/components/PublicHeader";
import StateRecordsLanding from "@/app/(public)/components/StateRecordsLanding";

export default function KeralaRecordsPage() {
  return (
    <>
      <PublicHeader />

      <StateRecordsLanding
        marketName="Kerala"
        marketLabel="KERALA RECORDS"
        marketDescription="Explore Kerala's highest-grossing theatrical performances through overall, non-Malayalam and language-wise records."
        motherLanguage="Malayalam"
        slug="kerala"
      />
    </>
  );
}
import Head from "next/head";
import CreateAgreementForm from "./create-agreement.component";

export default function NewAgreementsPage() {
  return (
    <div>
      <Head>
        <title>New Agreement</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col w-full max-w-4xl">
          <h1 className="text-2xl font-semibold text-center">New Agreement</h1>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <CreateAgreementForm />
          </div>
        </div>
      </div>
    </div>
  );
}

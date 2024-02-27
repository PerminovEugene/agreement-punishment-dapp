import Head from "next/head";
import List from "../../components/list/list.component";

export default function AgreementsPage() {
  return (
    <div>
      <Head>
        <title>Agreements</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col w-full max-w-4xl">
          <h1 className="text-2xl font-semibold text-center">Agreements</h1>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <List />
          </div>
        </div>
      </div>
    </div>
  );
}

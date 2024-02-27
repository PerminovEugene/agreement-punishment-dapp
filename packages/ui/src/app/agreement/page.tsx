import Head from "next/head";

export default function AgreementPage() {
  return (
    <div>
      <Head>
        <title>Agreement Detail</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col w-full max-w-4xl">
          <h1 className="text-2xl font-semibold text-center">Agreement</h1>
          <div className="overflow-x-auto shadow-md sm:rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

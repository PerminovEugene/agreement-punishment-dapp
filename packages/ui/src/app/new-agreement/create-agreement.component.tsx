import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState, FormEvent } from "react";
import { ethers } from "ethers";
import contractABI from "./contractAbi";

export default function CreateAgreementForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function call() {
    await window?.ethereum?.request({ method: "eth_requestAccounts" });

    // Create a provider to interact with a blockchain
    const provider = new ethers.providers.Web3Provider(window?.ethereum as any);

    // Get the signer to sign transactions (for write operations)
    const signer = provider.getSigner();

    // TODO
    const contractAddress = "";
    const contractABI = {};

    // Create a contract instance
    const contract = new ethers.Contract(
      contractAddress,
      contractABI as any,
      signer
    );

    // Calling a read function (doesn't require gas)
    const readResult = await contract.createAgreement();
    console.log("Read function result:", readResult);

    // Calling a write function (requires gas)
    const writeResult =
      await contract.someWriteFunction(/* function arguments here */);
    await writeResult.wait(); // Wait for the transaction to be mined
    console.log("Write function was called");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors when a new request starts

    try {
      const formData = new FormData(event.currentTarget);
      //
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit the data. Please try again.");
      }

      // Handle response if necessary
      const data = await response.json();
      // ...
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form>
      <div className="space-y-12 bg-gray-50 p-5">
        <div className="border-b">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            We will create agreement between 2 addresses.
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            If you add agreement text or pdf, it will be hashed and only hash
            will be saved to blockchain, so it's on you to keep original text or
            file. IT CAN NOT BE CHANGED LATER.
          </p>

          <div className="mt-10 grid grid-cols-12 gap-x-12 gap-y-12 sm:grid-cols-12">
            <div className="sm:col-span-9">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Participant address
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="participant2"
                    id="participant2"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Agreement participant address"
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Punishment amount
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="punishment"
                    id="punishment"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Agreement pdf
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon
                    className="mx-auto h-12 w-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create
          </button>
        </div>
      </div>
    </form>
  );
}

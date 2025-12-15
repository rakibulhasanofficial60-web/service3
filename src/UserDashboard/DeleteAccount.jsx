import React from "react";

const DeleteAccount = () => {
  return (
    <div className="w-full px-4 md:px-10 py-6">
      {/* Header */}
      <div className="border-[#E5E7EB] rounded-md p-4 md:p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-[#E5E7EB]-b pb-4">
          <span className="text-teal-600 text-2xl">🛡️</span>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Delete Account
          </h1>
        </div>

        {/* Card */}
        <div className="mt-6 border-[#E5E7EB] rounded-lg p-6 md:p-8 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Important</h2>

          <p className="text-gray-600 mb-4">
            We are sorry to see you go.
          </p>

          <p className="text-gray-600 mb-4">
            Once you submit a request to delete your account:
          </p>

          <p className="text-gray-600 mb-4">
            Your personal information will be deleted except for certain information
            that we're legally required to retain.
          </p>

          <p className="text-gray-600 mb-4">
            Read our{" "}
            <a href="#" className="text-teal-600 underline">
              Privacy Policy
            </a>
          </p>

          <p className="text-gray-600 mb-6">
            Once your account is deleted, you cannot reactivate it or regain
            access. You will need to create a new account if you wish to use
            ServiceMarket in the future.
          </p>

          {/* Delete Button */}
          <div className="flex justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 cursor-pointer rounded-md shadow-sm">
              DELETE MY ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
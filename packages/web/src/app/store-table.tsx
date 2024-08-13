export default function StoreTable() {
  return (
    <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* <!-- Card --> */}
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="inline-block min-w-full p-1.5 align-middle">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              {/* <!-- Header --> */}
              <div className="grid gap-3 border-b border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
                <div className="flex items-center gap-x-2 sm:col-span-1">
                  <label htmlFor="hs-table-search" className="sr-only">
                    Search
                  </label>
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      id="hs-table-search"
                      name="hs-table-search"
                      className="block w-full rounded-lg border-2 border-white px-3 py-2 ps-11 text-sm disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500"
                      placeholder="Search for items"
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center justify-end sm:col-span-2 md:grow">
                  <span className="text-sm text-gray-600 dark:text-neutral-400">
                    Total results: <span id="total-results">0</span>
                  </span>
                </div>
              </div>
              {/* <!-- End Header --> */}

              {/* <!-- Table --> */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                          Group
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                          Store ID
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                          Device Type
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                          Last Ping
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                          Latency
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  <tr className="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-neutral-200">
                      esi
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                      Civitavecchia
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                      BOSS MINI 30 DEVICE
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                      2023-08-14 10:30:00
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                      50 ms
                    </td>
                  </tr>
                  {/* <!-- Add more rows here as needed --> */}
                </tbody>
              </table>
              {/* <!-- End Table --> */}
            </div>
          </div>
        </div>
      </div>
      {/* <!-- End Card --> */}
    </div>
  )
}

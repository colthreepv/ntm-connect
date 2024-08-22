import { useEffect, useState } from 'react'
import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import { collection, getDocs, getFirestore } from 'firebase/firestore'
import { firebaseApp } from './login/firebase' // Adjust this import path as needed
import { useAuthStore } from './login/auth-store'

interface SalePointData {
  group: string
  storeId: string
  deviceType: string
  lastPing: string
  latency: string
}

interface SalePoint extends SalePointData {
  id: string
}

// Firestore Data Converter for SalePointData
const salePointConverter: FirestoreDataConverter<SalePointData> = {
  toFirestore: (salePoint: SalePointData) => salePoint,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data()
    return {
      group: data.group,
      storeId: data.storeId,
      deviceType: data.deviceType,
      lastPing: data.lastPing,
      latency: data.latency,
    } as SalePointData
  },
}

export function SkeletonTable() {
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
                  <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
                  <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-700"></div>
                </div>
                <div className="flex items-center justify-end sm:col-span-2 md:grow">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                </div>
              </div>
              {/* <!-- End Header --> */}

              {/* <!-- Table --> */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="h-4 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {/* Repeat this row 5 times for a loading effect */}
                  <tr className="bg-white dark:bg-neutral-900">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </td>
                  </tr>
                  {/* End of row to repeat */}
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

export default function StoreTable() {
  const [salePoints, setSalePoints] = useState<SalePoint[]>([])
  const [loading, setLoading] = useState(true)
  const { getUserToken } = useAuthStore((state) => ({ getUserToken: state.userToken }))

  useEffect(() => {
    const fetchSalePoints = async () => {
      const db = getFirestore(firebaseApp)
      const salePointsCollection = collection(db, 'salePoint').withConverter(salePointConverter)

      try {
        const querySnapshot = await getDocs(salePointsCollection)
        const salePointsData = querySnapshot.docs.map(
          (doc: QueryDocumentSnapshot<SalePointData>): SalePoint => ({
            id: doc.id,
            ...doc.data(),
          })
        )
        setSalePoints(salePointsData)
      } catch (error) {
        console.error('Error fetching sale points:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalePoints()
  }, [])

  const handleRowClick = async (salePoint: SalePoint) => {
    console.log('Row clicked:', salePoint)
    const userToken = await getUserToken()
    console.log('User token:', userToken)
  }

  if (loading) return <SkeletonTable />

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
                    Total results: <span id="total-results">{salePoints.length}</span>
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
                  {salePoints.map((salePoint) => (
                    <tr
                      key={salePoint.storeId}
                      className="cursor-pointer bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                      onClick={() => handleRowClick(salePoint)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {salePoint.group}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                        {salePoint.storeId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                        {salePoint.deviceType}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                        {salePoint.lastPing}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
                        {salePoint.latency}
                      </td>
                    </tr>
                  ))}
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

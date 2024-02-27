export default function List() {
  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Id
          </th>
          <th scope="col" className="px-6 py-3">
            Participant 1 address
          </th>
          <th scope="col" className="px-6 py-3">
            Participant 2 address
          </th>
          <th scope="col" className="px-6 py-3">
            Punishment
          </th>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
          >
            Project 1
          </th>
          <td className="px-6 py-4">A Next.js project with Tailwind CSS</td>
          <td className="px-6 py-4">Active</td>
          <td className="px-6 py-4">A Next.js project with Tailwind CSS</td>
          <td className="px-6 py-4">Active</td>
        </tr>
      </tbody>
    </table>
  );
}

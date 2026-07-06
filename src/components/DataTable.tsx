import { CCCDRecord } from "@/types/cccd";

export default function DataTable({ data }: { data: CCCDRecord[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full whitespace-nowrap text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 border-b">STT</th>
            <th className="p-3 border-b">Loại Thẻ</th>
            <th className="p-3 border-b">Số CCCD</th>
            <th className="p-3 border-b">Họ và Tên</th>
            <th className="p-3 border-b">Ngày Sinh</th>
            <th className="p-3 border-b">Giới Tính</th>
            <th className="p-3 border-b">Địa Chỉ</th>
            <th className="p-3 border-b">Vợ/Chồng</th>
            <th className="p-3 border-b">Cha</th>
            <th className="p-3 border-b">Mẹ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${row.type === 'Thẻ Căn cước' ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {row.type}
                </span>
              </td>
              <td className="p-3 font-medium">{row.idNumber}</td>
              <td className="p-3">{row.fullName}</td>
              <td className="p-3">{row.dob}</td>
              <td className="p-3">{row.gender}</td>
              <td className="p-3 max-w-xs truncate" title={row.address}>{row.address}</td>
              <td className="p-3">{row.spouseName}</td>
              <td className="p-3">{row.fatherName}</td>
              <td className="p-3">{row.motherName}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={10} className="p-6 text-center text-gray-500 italic">Chưa có dữ liệu. Hãy quét thẻ để bắt đầu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
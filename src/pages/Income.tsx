function Installments() {
  const payments = Array.from({ length: 21 }, (_, index) => ({
    number: index + 1,
    amount: "₹0",
    status: "Pending",
  }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Monthly Installments
        </h1>

        <p className="text-gray-400 mt-1">
          View your installment and payment status
        </p>
      </div>


      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <SummaryCard
          title="Total Payments"
          value="21"
        />

        <SummaryCard
          title="Paid Payments"
          value="0"
        />

        <SummaryCard
          title="Pending Payments"
          value="21"
        />

      </div>


      {/* Payment Status */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200">

          <h2 className="text-xl font-bold text-gray-900">
            Payment Status
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Payment status from 1 to 21
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-black text-white">

                <th className="px-6 py-4 text-left">
                  No.
                </th>

                <th className="px-6 py-4 text-left">
                  Payment
                </th>

                <th className="px-6 py-4 text-left">
                  Amount
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {payments.map((payment) => (

                <tr
                  key={payment.number}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {payment.number}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    Payment {payment.number}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {payment.amount}
                  </td>

                  <td className="px-6 py-4">

                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                      {payment.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


/* ---------------- Summary Card ---------------- */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold text-gray-900 mt-2">
        {value}
      </p>

    </div>
  );
}


export default Installments;
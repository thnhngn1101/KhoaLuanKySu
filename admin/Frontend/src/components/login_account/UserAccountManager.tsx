import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Account {
  cccd: string;
  ho_va_ten: string;
  password: string;
  passenger_type_id?: string;
  passenger_type_name?: string;
}

interface PassengerType {
  id: string;
  type_name: string;
}

const UserAccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [passengerTypes, setPassengerTypes] = useState<PassengerType[]>([]);

  const fetchAccounts = async () => {
    const res = await axios.get('http://localhost:5000/api/login_user_account/');
    setAccounts(res.data);
  };

  const fetchPassengerTypes = async () => {
    const res = await axios.get('http://localhost:5000/api/login_user_account/passenger_types');
    setPassengerTypes(res.data);
  };

  useEffect(() => {
    fetchAccounts();
    fetchPassengerTypes();
  }, []);

  const handleChangePassengerType = async (cccd: string, newTypeId: string) => {
    await axios.put(`http://localhost:5000/api/login_user_account/${cccd}`, {
      passenger_type_id: newTypeId
    });
    fetchAccounts();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý tài khoản người dùng</h2>
      <table className="w-full border text-sm text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">CCCD</th>
            <th>Họ và tên</th>
            <th>Mật khẩu</th>
            <th>Loại hành khách</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.cccd} className="border-t hover:bg-gray-50">
              <td>{acc.cccd}</td>
              <td>{acc.ho_va_ten}</td>
              <td>{acc.password}</td>
              <td>
                <select
                  value={acc.passenger_type_id || ''}
                  onChange={(e) => handleChangePassengerType(acc.cccd, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Chọn loại</option>
                  {passengerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserAccountManager;

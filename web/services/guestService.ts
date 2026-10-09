import { apiRequest } from "@/lib/apiClient";

export interface WalletInfo {
  id: number;
  user_id: number;
  balance: number;
  pending_withdrawal: number;
  currency: string;
  is_active: number;
}

export interface WalletTransactionItem {
  id: number;
  wallet_id: number;
  user_id: number;
  type: "refund" | "withdrawal" | "topup" | "adjustment";
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface BankAccountItem {
  id: number;
  user_id?: number;
  userId?: number;
  bank_name?: string;
  bankName?: string;
  bank_code?: string;
  bankCode?: string;
  account_number?: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  account_number_masked?: string;
  account_holder_name?: string;
  accountHolderName?: string;
  is_default?: number | boolean;
  isDefault?: boolean;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

export interface VoucherItem {
  id: number;
  code: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  max_discount_amount: number;
  min_booking_amount: number;
  required_points: number;
  end_date: string;
}

export interface FavoriteItem {
  id: number;
  name: string;
  city: string;
  street_address: string;
  price_per_night: number;
  cover_image: string;
  rating_average: number;
  review_count: number;
  type_name?: string;
}

export async function getGuestWallet(userId: number): Promise<WalletInfo | null> {
  try {
    const res = await apiRequest<any>(`/api/wallet?userId=${userId}`);
    return res?.data || res || null;
  } catch (_) {
    return null;
  }
}

export async function getGuestWalletTransactions(userId: number): Promise<WalletTransactionItem[]> {
  try {
    const res = await apiRequest<any>(`/api/wallet/transactions?userId=${userId}&limit=20`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch (_) {
    return [];
  }
}

export async function getGuestBankAccounts(userId: number): Promise<BankAccountItem[]> {
  try {
    const res = await apiRequest<any>(`/api/bank-accounts?userId=${userId}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch (_) {
    return [];
  }
}

export async function addGuestBankAccount(payload: {
  userId: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
}): Promise<boolean> {
  try {
    await apiRequest<any>(`/api/bank-accounts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err: any) {
    throw new Error(err?.message || "Lỗi khi liên kết ngân hàng");
  }
}

export async function requestGuestWithdrawal(payload: {
  userId: number;
  amount: number;
  bankAccountId: number;
}): Promise<any> {
  return apiRequest<any>(`/api/wallet/withdraw`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getGuestVouchers(userId: number): Promise<VoucherItem[]> {
  try {
    const res = await apiRequest<any>(`/api/promotions/my-vouchers?userId=${userId}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch (_) {
    return [];
  }
}

export async function getGuestFavorites(userId: number): Promise<FavoriteItem[]> {
  try {
    const res = await apiRequest<any>(`/api/favorites?userId=${userId}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch (_) {
    return [];
  }
}

export async function revealGuestBankAccount(payload: {
  accountId: number;
  password: string;
  userId?: number;
}): Promise<BankAccountItem> {
  const res = await apiRequest<any>(`/api/bank-accounts/${payload.accountId}/reveal`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function setGuestBankAccountDefault(accountId: number, userId: number): Promise<any> {
  return apiRequest<any>(`/api/bank-accounts/${accountId}/default`, {
    method: "PUT",
    body: JSON.stringify({ userId }),
  });
}

export async function deleteGuestBankAccount(accountId: number, userId: number): Promise<any> {
  return apiRequest<any>(`/api/bank-accounts/${accountId}?userId=${userId}`, {
    method: "DELETE",
  });
}

export type UserRole = "owner" | "staff";
export type TransactionType = "in" | "sale" | "adjust";

export type Profile = {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  product_id: string;
  type: TransactionType;
  quantity: number;
  unit_price: number | null;
  revenue: number | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & { name: string };
        Update: Partial<Product>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction> & {
          product_id: string;
          type: TransactionType;
          quantity: number;
        };
        Update: Partial<Transaction>;
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

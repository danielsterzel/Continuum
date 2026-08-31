"use client";

import {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

import type { User } from "@/lib/types/User";
import { getDatabase } from "@/lib/db/database";
import { UserRepository } from "@/lib/db/repositories/user_repository";

type UserContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
};
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const db = await getDatabase();
      const repository = new UserRepository(db);

      const localUser = await repository.get();

      setUser(localUser);
      setLoaded(true);
    }
    loadUser();
  }, []);

      if (!loaded) {
        return null;
      }
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser used not inside UserProvider");
  }
  return context;
}

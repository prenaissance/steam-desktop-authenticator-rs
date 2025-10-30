"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "./ui/card"
import { LogOut, User, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useActiveAccount } from "~/hooks/use-accounts"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useInvokeQuery } from "~/api/hooks"
import { getTotp } from "~/api/totp"

interface AccountSelectorProps {
  loading?: boolean
}

export const AccountSelector = ({ loading }: AccountSelectorProps) => {
  const { accounts, account, setActiveAccount, removeAccount } = useActiveAccount()
  const { invalidate } = useInvokeQuery(getTotp);
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    )
  }

  if (!account) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">No Account Selected</p>
            <p className="text-sm text-gray-500">Please select an account</p>
          </div>
        </div>
      </Card>
    )
  }

  const accountsArray = Object.entries(accounts).map(([username, acc]) => ({
    username,
    ...acc,
  }))

  return (
    <Card className="relative p-4 backdrop-blur-xl bg-card/50 border border-border/50 rounded-2xl shadow-lg" ref={dropdownRef}>
      <div
        className="flex items-center justify-between cursor-pointer gap-2"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          {account.avatarUrl ? (
            <Avatar className="h-12 w-12 ring-1 ring-primary/20">
              <AvatarImage src={account.avatarUrl} />
              <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}

          <p className="font-medium text-foreground">{account.username}</p>
        </div>

        <button
          className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
          onClick={async (e) => {
            e.stopPropagation()
            try {
              if (!account.username) return toast.error("No account selected")
              await removeAccount(account.username)
              toast.success(`Logged out from ${account.username}`)
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to logout")
            }
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {open && accountsArray.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-lg flex flex-col overflow-hidden z-50"
          >
            {accountsArray
              .filter((acc) => acc.username !== account.username)
              .map((acc) => (
                <div
                  key={acc.username}
                  className="flex items-center gap-3 p-4 hover:bg-card/50 cursor-pointer transition-colors"
                  onClick={async () => {
                    try {
                      await setActiveAccount(acc.username)
                      invalidate();
                      toast.success(`Switched to ${acc.username}`)
                      setOpen(false)
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to switch account")
                    }
                  }}
                >
                  {acc.avatarUrl ? (
                    <Avatar className="h-10 w-10 ring-1 ring-primary/20">
                      <AvatarImage src={acc.avatarUrl} />
                      <AvatarFallback>{acc.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <p className="font-medium">{acc.username}</p>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

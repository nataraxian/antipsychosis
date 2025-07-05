"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Lightweight <Tabs> component with zero external dependencies
// ---------------------------------------------------------------------------

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
}

function Tabs({ defaultValue, className, children, ...props }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// TabsList – container for trigger buttons
// ---------------------------------------------------------------------------

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-px rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// TabsTrigger – clickable tab button
// ---------------------------------------------------------------------------

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>")

  const isActive = ctx.value === value

  return (
    <button
      onClick={() => ctx.setValue(value)}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex min-w-[100px] items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium " +
          "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
          "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// TabsContent – shows its children when its value matches the active tab
// ---------------------------------------------------------------------------

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>")

  if (ctx.value !== value) return null

  return (
    <div className={cn("mt-4 focus-visible:outline-none", className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

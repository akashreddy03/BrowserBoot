"use client"

import type { ReactNode } from "react"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import { Toaster } from "./toaster"

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme="dark" enableSystem={false}>
        {children}
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  )
}

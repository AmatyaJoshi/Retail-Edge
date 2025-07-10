declare module 'input-otp' {
  import * as React from 'react'

  export interface OTPInputContextValue {
    slots: Array<{
      char: string
      hasFakeCaret: boolean
      isActive: boolean
    }>
    setValue: (index: number, value: string) => void
  }

  export interface OTPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    maxLength?: number
    value?: string
    onChange?: (value: string) => void
    render?: (props: { slots: Array<{ index: number }> }) => React.ReactNode
  }

  export const OTPInput: React.ForwardRefExoticComponent<OTPInputProps>
  export const OTPInputContext: React.Context<OTPInputContextValue>
} 
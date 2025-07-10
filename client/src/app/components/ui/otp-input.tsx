import * as React from "react"
import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  maxLength?: number
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ className, maxLength = 6, value = "", onChange, disabled, ...props }, ref) => {
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
    const digits = value.split("").concat(Array(maxLength - value.length).fill(""))

    React.useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, maxLength)
    }, [maxLength])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newValue = e.target.value.replace(/\D/g, "").slice(0, 1)
      const newDigits = [...digits]
      newDigits[index] = newValue
      const newValueString = newDigits.join("")
      onChange?.(newValueString)

      if (newValue && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, maxLength)
      onChange?.(pastedData)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          "has-[:disabled]:opacity-50",
          className
        )}
        onPaste={handlePaste}
        {...props}
      >
        {digits.map((digit, index) => (
          <React.Fragment key={index}>
            <div
              className={cn(
                "relative h-11 w-10 text-center text-base font-medium",
                "border border-gray-200 rounded-md",
                "focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400",
                "disabled:cursor-not-allowed disabled:opacity-50",
                focusedIndex === index && "z-10 ring-2 ring-blue-400 border-blue-400"
              )}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                disabled={disabled}
                className={cn(
                  "absolute inset-0 w-full h-full text-center text-base font-medium",
                  "bg-transparent border-0 focus:outline-none focus:ring-0",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </div>
            {index < maxLength - 1 && (
              <div role="separator">
                <Dot className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
)
OTPInput.displayName = "OTPInput"

export { OTPInput } 
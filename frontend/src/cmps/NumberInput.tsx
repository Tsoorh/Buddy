import React from 'react'
import { Minus, Plus } from 'lucide-react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (val: number) => void
  step?: number
  min?: number
  max?: number
  name?: string
  hint?: string
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  label, value, onChange, step = 1, min = 0, max, name, hint 
}) => {
  const handleDecrement = () => {
    const newVal = Math.max(min, value - step)
    onChange(Number(newVal.toFixed(2)))
  }

  const handleIncrement = () => {
    const newVal = max !== undefined ? Math.min(max, value + step) : value + step
    onChange(Number(newVal.toFixed(2)))
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) {
      onChange(val)
    } else {
      onChange(0)
    }
  }

  return (
    <div className="auth-input-group w-100">
      {label && <label className="auth-label">{label}</label>}
      <div className="d-flex align-items-stretch border border-secondary" 
           style={{ 
             borderRadius: '12px', 
             background: 'rgba(255, 255, 255, 0.1)',
             transition: 'border-color 0.2s',
             overflow: 'hidden',
             height: '48px'
           }}>
        <button 
          type="button"
          className="btn btn-accent btn-number-control p-0 d-flex align-items-center justify-content-center border-0"
          onClick={handleDecrement}
          style={{ width: '45px', borderRadius: '0', minWidth: '45px' }}
        >
          <Minus size={18} />
        </button>
        
        <input 
          type="number"
          name={name}
          className="flex-grow-1 text-center border-0 bg-transparent p-0"
          value={value}
          onChange={onInputChange}
          step={step}
          min={min}
          max={max}
          style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            outline: 'none', 
            boxShadow: 'none',
            color: '#fff',
            width: '100%',
            minWidth: '0'
          }}
        />

        <button 
          type="button"
          className="btn btn-accent btn-number-control p-0 d-flex align-items-center justify-content-center border-0"
          onClick={handleIncrement}
          style={{ width: '45px', borderRadius: '0', minWidth: '45px' }}
        >
          <Plus size={18} />
        </button>
      </div>
      {hint && <small className="auth-hint d-block mt-1">{hint}</small>}
    </div>
  )
}

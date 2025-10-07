'use client'

import React from 'react'
import { NewTimePicker } from './new-time-picker'
import { BetterDatePicker } from './better-date-picker'
import { baseInputClasses, baseLabelClasses } from '@/lib/form-input-theme'

interface InputProps {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  className?: string
}

interface TextareaProps {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  rows?: number
  className?: string
}

interface SelectProps {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  children: React.ReactNode
  className?: string
}

interface DateInputProps {
  name: string
  label: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  className?: string
}

interface TimeInputProps {
  name: string
  label: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  className?: string
}

interface ColorInputProps {
  name: string
  label: string
  defaultValue?: string
  className?: string
}


export function Input({ name, label, required, placeholder, defaultValue, type = 'text', className = '' }: InputProps) {
  return (
    <div className={className}>
      <label className={baseLabelClasses}>
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={baseInputClasses}
        placeholder={placeholder}
      />
    </div>
  )
}

export function Textarea({ name, label, required, placeholder, defaultValue, rows = 3, className = '' }: TextareaProps) {
  return (
    <div className={className}>
      <label className={baseLabelClasses}>
        {label} {required && '*'}
      </label>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={baseInputClasses}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  )
}

export function Select({ name, label, required, defaultValue, children, className = '' }: SelectProps) {
  return (
    <div className={className}>
      <label className={baseLabelClasses}>
        {label} {required && '*'}
      </label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={baseInputClasses}
      >
        {children}
      </select>
    </div>
  )
}

export function DateInput({ name, label, required, value, onChange, className = '' }: DateInputProps) {
  return (
    <BetterDatePicker
      name={name}
      label={label}
      required={required}
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}

export function TimeInput({ name, label, required, value, onChange, className = '' }: TimeInputProps) {
  return (
    <NewTimePicker
      name={name}
      label={label}
      required={required}
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}

export function ColorInput({ name, label, defaultValue = '#FF6B35', className = '' }: ColorInputProps) {
  return (
    <div className={className}>
      <label className={baseLabelClasses}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 font-mono text-sm"
          placeholder="#FF6B35"
          onChange={(e) => {
            const colorInput = e.target.previousElementSibling as HTMLInputElement
            if (colorInput) colorInput.value = e.target.value
          }}
        />
      </div>
    </div>
  )
}

interface CheckboxProps {
  name: string
  label: string
  checked?: boolean
  className?: string
}

export function Checkbox({ name, label, checked = false, className = '' }: CheckboxProps) {
  return (
    <div className={className}>
      <label className="flex items-center">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
    </div>
  )
}

interface FileInputProps {
  name: string
  label: string
  accept?: string
  multiple?: boolean
  className?: string
}

export function FileInput({ name, label, accept = 'image/*', multiple = false, className = '' }: FileInputProps) {
  return (
    <div className={className}>
      <label className={baseLabelClasses}>
        {label}
      </label>
      <input
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className={baseInputClasses.replace('placeholder-gray-500', '')}
      />
    </div>
  )
}

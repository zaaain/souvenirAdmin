import { useState } from 'react'

function EnvelopeIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </span>
  )
}

function MessageIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </span>
  )
}

function BellIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </span>
  )
}

const Settings = () => {
  const [emailOn, setEmailOn] = useState(true)
  const [smsOn, setSmsOn] = useState(false)
  const [inAppOn, setInAppOn] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Settings</h1>
        <p className="text-gray-500 font-Manrope mt-1">Tailor according to your liking.</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Notification Preferences</h3>
        <div className="border-b border-gray-200 mb-4" />

        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <EnvelopeIcon />
              <div>
                <p className="text-sm font-ManropeBold text-gray-800">Email Notifications</p>
                <p className="text-xs font-Manrope text-gray-500 mt-0.5">Receive notifications via email.</p>
              </div>
            </div>
            <label className="shrink-0 flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailOn}
                onChange={(e) => setEmailOn(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-primary focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <MessageIcon />
              <div>
                <p className="text-sm font-ManropeBold text-gray-800">SMS Notifications</p>
                <p className="text-xs font-Manrope text-gray-500 mt-0.5">Receive notifications via text message.</p>
              </div>
            </div>
            <label className="shrink-0 flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsOn}
                onChange={(e) => setSmsOn(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-primary focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <BellIcon />
              <div>
                <p className="text-sm font-ManropeBold text-gray-800">In-App Notifications</p>
                <p className="text-xs font-Manrope text-gray-500 mt-0.5">Receive notifications within the platform.</p>
              </div>
            </div>
            <label className="shrink-0 flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inAppOn}
                onChange={(e) => setInAppOn(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-primary focus:ring-primary/20"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Session Management</h3>
        <div className="border-b border-gray-200 mb-4" />

        <div className="flex items-start justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-ManropeBold text-gray-800">Current Session</p>
            <p className="text-xs font-Manrope text-gray-500 mt-0.5">Chrome on Windows - Chicago, IL</p>
            <p className="text-xs font-Manrope text-primary mt-1">Active now</p>
          </div>
          <span className="shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope bg-emerald-100 text-emerald-700">
            Current
          </span>
        </div>
      </div>
    </div>
  )
}

export default Settings

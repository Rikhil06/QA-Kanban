import React from 'react'

export default function Dropdown({ text }: { text: string}) {
  return (
    <div className="relative inline-block text-left">
        <div>
            <button type="button" className="inline-flex w-full justify-center gap-x-1.5 px-3 py-2 text-sm text-gray-900 ring-gray-300 ring-inset hover:bg-gray-200 hover:rounded-md cursor-pointer" id="menu-button" aria-expanded="true" aria-haspopup="true">
            {text}
            </button>
        </div>
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
            <div className="py-1" role="none">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-0">Edit</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1}id="menu-item-1">Duplicate</a>
            </div>
            <div className="py-1" role="none">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-2">Archive</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-3">Move</a>
            </div>
            <div className="py-1" role="none">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-4">Share</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-5">Add to favorites</a>
            </div>
            <div className="py-1" role="none">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="menu-item-6">Delete</a>
            </div>
        </div>
        </div>
  )
}

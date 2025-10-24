"use client"

import React, { useEffect } from 'react'

export default function Footer() {

  return (
    <footer className='footer-wrap'>
      <div className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <strong>A4 PDF Maker</strong>
              <div className="muted">DS.Lee © copyright {new Date().getFullYear()} PDF Microsite</div>
            </div>
            <div className="footer-right">
              <div>Contact: support@example.com</div>
              <div className="muted">Built with React, Next.js, ReactQuill</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import { NAMA_PROGRAM } from './config/config'

// Pages
import Home from './pages/Home'
import Scanner2Mockup from './pages/Scanner2Mockup'
import ScannerRack3Mockup from './pages/ScannerRack3Mockup'
import StockOpnameYearlyMockup from './pages/StockOpnameYearlyMockup'
import ScannerDetailTtbaMockup from './pages/ScannerDetailTtbaMockup'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/mock-scanner2',
      element: <Scanner2Mockup />,
    },
    {
      path: '/mock-scannerrack3',
      element: <ScannerRack3Mockup />,
    },
    {
      path: '/mock-stockopname-yearly',
      element: <StockOpnameYearlyMockup />,
    },
    {
      path: '/mock-scanner-detail-ttba',
      element: <ScannerDetailTtbaMockup />,
    },
  ],
  {
    basename: `/${NAMA_PROGRAM}`,
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import ChartLine from 'mdi-material-ui/ChartLine'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
import FlashOutline from 'mdi-material-ui/FlashOutline'
import RobotOutline from 'mdi-material-ui/RobotOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'Dashboard',
    },
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Revenue & Equity',
      icon: CurrencyUsd,
      path: '/dashboard/revenue'
    },
    {
      title: 'Sales',
      icon: ChartLine,
      path: '/dashboard/sales'
    },
    {
      title: 'Collection',
      icon: FileDocumentOutline,
      path: '/dashboard/collection'
    },
    {
      title: 'Utility & Expenses',
      icon: FlashOutline,
      path: '/dashboard/utility-expenses'
    },
     {
      title: 'KM',
      icon: FormatLetterCase,
      path: '/dashboard/km'
    },
    {
      title: 'AI Helper',
      icon: RobotOutline,
      path: '/dashboard/aihelper',
      // openInNewTab: true
    },
    {
      sectionTitle: 'Account'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    {
      sectionTitle: 'Administration'
    },
    {
      title: 'Input Data',
      icon: FormatLetterCase,
      path: '/masterdata',
      // openInNewTab: true
    },
    {
      title: 'Input News & Events',
      icon: FileDocumentOutline,
      path: '/carousel',
      // openInNewTab: true
    },

    // {
    //   title: 'Register',
    //   icon: AccountPlusOutline,
    //   path: '/pages/register',
    //   openInNewTab: true
    // },
    // {
    //   title: 'Error',
    //   icon: AlertCircleOutline,
    //   path: '/pages/error',
    //   openInNewTab: true
    // },
    // {
    //   sectionTitle: 'User Interface'
    // },
    // {
    //   title: 'Typography',
    //   icon: FormatLetterCase,
    //   path: '/typography'
    // },
    // {
    //   title: 'Icons',
    //   path: '/icons',
    //   icon: GoogleCirclesExtended
    // },
    // {
    //   title: 'Cards',
    //   icon: CreditCardOutline,
    //   path: '/cards'
    // },
    // {
    //   title: 'Tables',
    //   icon: Table,
    //   path: '/tables'
    // },
    // {
    //   icon: CubeOutline,
    //   title: 'Form Layouts',
    //   path: '/form-layouts'
    // }
  ]
}

export default navigation

import { DUMMY_ID } from '@/config/constants';
import { routes } from '@/config/routes';
import {
  PiAirplaneTiltDuotone,
  PiApplePodcastsLogoDuotone,
  PiArrowsOutDuotone,
  PiArrowsOutLineHorizontalDuotone,
  PiBellSimpleRingingDuotone,
  PiBinocularsDuotone,
  PiBriefcaseDuotone,
  PiBrowserDuotone,
  PiCalendarDuotone,
  PiCalendarPlusDuotone,
  PiCaretCircleUpDownDuotone,
  PiChartBarDuotone,
  PiChartLineUpDuotone,
  PiChartPieSliceDuotone,
  PiChatCenteredDotsDuotone,
  PiClipboardTextDuotone,
  PiCodesandboxLogoDuotone,
  PiCoinDuotone,
  PiCreditCardDuotone,
  PiCurrencyCircleDollarDuotone,
  PiCurrencyDollarDuotone,
  PiEnvelopeDuotone,
  PiEnvelopeSimpleOpenDuotone,
  PiFeatherDuotone,
  PiFolderDuotone,
  PiFolderLockDuotone,
  PiFoldersDuotone,
  PiFolderUserDuotone,
  PiGridFourDuotone,
  PiHammerDuotone,
  PiHeadsetDuotone,
  PiHourglassSimpleDuotone,
  PiHouseLineDuotone,
  PiListNumbersDuotone,
  PiLockKeyDuotone,
  PiMapPinLineDuotone,
  PiNewspaperClippingDuotone,
  PiNoteBlankDuotone,
  PiPackageDuotone,
  PiPresentationChartDuotone,
  PiPushPinDuotone,
  PiRocketLaunchDuotone,
  PiScalesDuotone,
  PiShapesDuotone,
  PiShieldCheckDuotone,
  PiShootingStarDuotone,
  PiShoppingCartDuotone,
  PiSparkleDuotone,
  PiSquaresFourDuotone,
  PiStairsDuotone,
  PiStepsDuotone,
  PiTableDuotone,
  PiUserCircleDuotone,
  PiUserDuotone,
  PiUserGearDuotone,
  PiUserPlusDuotone,
} from 'react-icons/pi';
import { GoHome, GoPeople } from 'react-icons/go';
import { MdOutlineCampaign, MdOutlineSell } from 'react-icons/md';
import { IoReturnDownBack } from 'react-icons/io5';
// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'Overview',
  },
  {
    name: 'Home',
    href: '/',
    icon: <GoHome />,
  },
  {
    name: 'Products',
    href: '#',
    icon: <PiPackageDuotone />,
    dropdownItems: [
      {
        name: 'All Products',
        href: routes.eCommerce.products,
        badge: '',
      },
      {
        name: 'Create Product',
        href: routes.eCommerce.createProduct,
      },
    ],
  },
  {
    name: 'Categories',
    href: routes.eCommerce.categories,
    icon: <PiSquaresFourDuotone />,
  },
  {
    name: 'Orders',
    href: routes.eCommerce.orders,
    icon: <PiShoppingCartDuotone />,
  },
  {
    name: 'Returns',
    href: routes.eCommerce.orders,
    icon: <IoReturnDownBack />,
  },
  {
    name: 'Reviews',
    href: routes.eCommerce.reviews,
    icon: <GoPeople />,
  },
  {
    name: 'Invoice',
    href: '#',
    icon: <PiCurrencyDollarDuotone />,
    dropdownItems: [
      {
        name: 'Builder',
        href: routes.invoice.builder,
      },
      {
        name: 'List',
        href: routes.invoice.home,
      },
      {
        name: 'Details',
        href: routes.invoice.details(DUMMY_ID),
      },
      {
        name: 'Create',
        href: routes.invoice.create,
      },
      {
        name: 'Edit',
        href: routes.invoice.edit(DUMMY_ID),
      },
    ],
  },
  {
    name: 'Coupon',
    href: routes.invoice.builder,
    icon: <PiNewspaperClippingDuotone />,
  },
  {
    name: 'Banner',
    href: routes.invoice.builder,
    icon: <MdOutlineCampaign />,
  },
  {
    name: 'Flash Sale',
    href: routes.invoice.builder,
    icon: <MdOutlineSell />,
  },
  {
    name: 'Gallery',
    href: routes.file.manager,
    icon: <PiFoldersDuotone />,
  },
  {
    name: 'Analytics',
    href: routes.analytics,
    icon: <PiChartBarDuotone />,
  },
  {
    name: 'Support',
    href: '#',
    icon: <PiHeadsetDuotone />,
    dropdownItems: [
      {
        name: 'Inbox',
        href: routes.support.inbox,
      },
      {
        name: 'Snippets',
        href: routes.support.snippets,
      },
      {
        name: 'Templates',
        href: routes.support.templates,
      },
    ],
  },
  {
    name: 'Roles & Permissions',
    href: routes.rolesPermissions,
    icon: <PiFolderLockDuotone />,
  },
  {
    name: 'Store Settings',
    href: routes.jobBoard.dashboard,
    icon: <PiShapesDuotone />,
  },
  {
    name: 'Logistics',
    href: '#',
    icon: <PiPackageDuotone />,
    dropdownItems: [
      {
        name: 'Shipment List',
        href: routes.logistics.shipmentList,
      },
      {
        name: 'Shipment Details',
        href: routes.logistics.shipmentDetails(DUMMY_ID),
      },
      {
        name: 'Create Shipment',
        href: routes.logistics.createShipment,
      },
      {
        name: 'Edit Shipment',
        href: routes.logistics.editShipment(DUMMY_ID),
      },
      {
        name: 'Customer Profile',
        href: routes.logistics.customerProfile,
      },
      {
        name: 'Tracking',
        href: routes.logistics.tracking(DUMMY_ID),
      },
    ],
  },
  // label start
  {
    name: 'Search & Filters',
  },
  {
    name: 'Real Estate',
    href: routes.searchAndFilter.realEstate,
    icon: <PiHouseLineDuotone />,
  },
  {
    name: 'Flight Booking',
    href: routes.searchAndFilter.flight,
    icon: <PiAirplaneTiltDuotone />,
  },
  {
    name: 'NFT',
    href: routes.searchAndFilter.nft,
    icon: <PiCoinDuotone />,
  },
  // label end
  // label start
  {
    name: 'Widgets',
  },
  // label end
  {
    name: 'Cards',
    href: routes.widgets.cards,
    icon: <PiSquaresFourDuotone />,
  },
  {
    name: 'Icons',
    href: routes.widgets.icons,
    icon: <PiFeatherDuotone />,
  },
  {
    name: 'Charts',
    href: routes.widgets.charts,
    icon: <PiChartLineUpDuotone />,
  },
  // {
  //   name: 'Banners',
  //   href: routes.widgets.banners,
  //   icon: <PiImageDuotone />,
  // },
  {
    name: 'Maps',
    href: routes.widgets.maps,
    icon: <PiMapPinLineDuotone />,
  },
  {
    name: 'Email Templates',
    href: routes.emailTemplates,
    icon: <PiEnvelopeDuotone />,
  },
  // label start
  {
    name: 'Forms',
  },
  // label end
  {
    name: 'Account Settings',
    href: routes.forms.profileSettings,
    icon: <PiUserGearDuotone />,
  },
  {
    name: 'Notification Preference',
    href: routes.forms.notificationPreference,
    icon: <PiBellSimpleRingingDuotone />,
  },
  {
    name: 'Personal Information',
    href: routes.forms.personalInformation,
    icon: <PiUserDuotone />,
  },
  {
    name: 'Newsletter',
    href: routes.forms.newsletter,
    icon: <PiEnvelopeSimpleOpenDuotone />,
  },
  {
    name: 'Multi Step',
    href: routes.multiStep,
    icon: <PiStepsDuotone />,
  },
  {
    name: 'Multi Step 2',
    href: routes.multiStep2,
    icon: <PiStairsDuotone />,
  },
  {
    name: 'Payment Checkout',
    href: routes.eCommerce.checkout,
    icon: <PiCreditCardDuotone />,
  },
  // label start
  {
    name: 'Tables',
  },
  // label end
  {
    name: 'Basic',
    href: routes.tables.basic,
    icon: <PiGridFourDuotone />,
  },
  {
    name: 'Collapsible',
    href: routes.tables.collapsible,
    icon: <PiCaretCircleUpDownDuotone />,
  },
  {
    name: 'Enhanced',
    href: routes.tables.enhanced,
    icon: <PiTableDuotone />,
  },
  {
    name: 'Sticky Header',
    href: routes.tables.stickyHeader,
    icon: <PiBrowserDuotone />,
  },
  {
    name: 'Pagination',
    href: routes.tables.pagination,
    icon: <PiListNumbersDuotone />,
  },
  {
    name: 'Search',
    href: routes.tables.search,
    icon: <PiHourglassSimpleDuotone />,
  },
  {
    name: 'Resizable',
    href: routes.tables.resizable,
    icon: <PiArrowsOutLineHorizontalDuotone />,
  },
  {
    name: 'Pinning',
    href: routes.tables.pinning,
    icon: <PiPushPinDuotone />,
  },
  {
    name: 'Drag & Drop',
    href: routes.tables.dnd,
    icon: <PiArrowsOutDuotone />,
  },
  // label start
  {
    name: 'Pages',
  },
  {
    name: 'Welcome',
    href: routes.welcome,
    icon: <PiShootingStarDuotone />,
  },
  {
    name: 'Coming soon',
    href: routes.comingSoon,
    icon: <PiRocketLaunchDuotone />,
  },
  {
    name: 'Access Denied',
    href: routes.accessDenied,
    icon: <PiFolderLockDuotone />,
  },
  {
    name: 'Not Found',
    href: routes.notFound,
    icon: <PiBinocularsDuotone />,
  },
  {
    name: 'Maintenance',
    href: routes.maintenance,
    icon: <PiHammerDuotone />,
  },
  {
    name: 'Blank',
    href: routes.blank,
    icon: <PiNoteBlankDuotone />,
  },
];

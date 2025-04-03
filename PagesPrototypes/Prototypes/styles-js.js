// styles.js - Centralized design system for consistent styling across the application

// Color palette
export const colors = {
  primary: "#F56600", // Orange
  secondary: "#522D80", // Purple
  background: "#f9f9f9", // Light gray
  text: "#333333", // Dark gray
  textLight: "#666666", // Medium gray
  white: "#FFFFFF",
  lightBorder: "#dddddd",
  error: "#dc3545", // Red
  success: "#28a745", // Green
  info: "#007bff", // Blue
  warning: "#ffc107" // Yellow
};

// Typography
export const typography = {
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  fontSize: {
    small: "14px",
    base: "16px",
    medium: "18px",
    large: "20px",
    xlarge: "24px",
    xxlarge: "36px"
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semiBold: "600",
    bold: "700"
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",
    loose: "1.8"
  }
};

// Spacing
export const spacing = {
  xs: "5px",
  sm: "10px",
  md: "15px",
  lg: "20px",
  xl: "30px",
  xxl: "40px"
};

// Borders and Shadows
export const borders = {
  radius: {
    small: "4px",
    medium: "8px",
    large: "12px",
    pill: "9999px",
    circle: "50%"
  },
  width: {
    thin: "1px",
    medium: "2px",
    thick: "4px"
  }
};

export const shadows = {
  small: "0 2px 5px rgba(0, 0, 0, 0.1)",
  medium: "0 4px 10px rgba(0, 0, 0, 0.1)",
  large: "0 8px 16px rgba(0, 0, 0, 0.1)",
  primaryShadow: "0 4px 8px rgba(245, 102, 0, 0.3)" // Orange-tinted shadow
};

// Layout Components
export const layout = {
  pageContainer: {
    minHeight: "100vh",
    fontFamily: typography.fontFamily,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: "1",
    padding: `${spacing.xxl} ${spacing.lg}`,
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%"
  },
  sectionContainer: {
    marginBottom: spacing.xxl
  }
};

// Component Styles
export const components = {
  // Headings
  pageTitle: {
    fontSize: typography.fontSize.xxlarge,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: "center",
    fontWeight: typography.fontWeight.bold
  },
  sectionTitle: {
    fontSize: typography.fontSize.xlarge,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: typography.fontWeight.semiBold
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borders.radius.medium,
    boxShadow: shadows.medium,
    padding: spacing.xl,
    marginBottom: spacing.xl
  },
  cardWithPrimaryShadow: {
    backgroundColor: colors.white,
    borderRadius: borders.radius.medium,
    boxShadow: shadows.primaryShadow,
    padding: spacing.xl,
    marginBottom: spacing.xl
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    color: colors.white,
    border: "none",
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borders.radius.medium,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    color: colors.primary,
    border: `${borders.width.thin} solid ${colors.primary}`,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borders.radius.medium,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  buttonAction: {
    backgroundColor: colors.info,
    color: colors.white,
    border: "none",
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borders.radius.medium,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  },
  buttonDanger: {
    backgroundColor: colors.error,
    color: colors.white,
    border: "none",
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borders.radius.medium,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  },
  
  // Form Elements
  input: {
    width: "100%",
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    borderRadius: borders.radius.medium,
    border: `${borders.width.thin} solid ${colors.lightBorder}`,
    marginBottom: spacing.md
  },
  formContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borders.radius.medium,
    boxShadow: shadows.medium
  },
  label: {
    display: "block",
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  
  // Links
  link: {
    color: colors.primary,
    textDecoration: "none",
    fontWeight: typography.fontWeight.medium,
    transition: "color 0.3s ease"
  },
  
  // Tables
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeader: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: spacing.md,
    textAlign: "left"
  },
  tableCell: {
    padding: spacing.md,
    borderBottom: `${borders.width.thin} solid ${colors.lightBorder}`,
    fontSize: typography.fontSize.base
  },
  tableRow: {
    transition: "background-color 0.2s ease"
  },
  
  // Specific Components
  searchContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.md
  },
  productCard: {
    border: `${borders.width.thin} solid ${colors.lightBorder}`,
    borderRadius: borders.radius.medium,
    padding: spacing.lg,
    width: "250px",
    backgroundColor: colors.white,
    boxShadow: shadows.small,
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottom: `${borders.width.thin} solid ${colors.lightBorder}`,
    marginBottom: spacing.md
  }
};

// Function to change button color on hover
export const buttonHoverState = {
  primary: (e) => {
    e.target.style.backgroundColor = colors.secondary;
  },
  primaryReset: (e) => {
    e.target.style.backgroundColor = colors.primary;
  },
  secondary: (e) => {
    e.target.style.backgroundColor = colors.primary;
    e.target.style.color = colors.white;
  },
  secondaryReset: (e) => {
    e.target.style.backgroundColor = colors.white;
    e.target.style.color = colors.primary;
  },
  action: (e) => {
    e.target.style.backgroundColor = "#0069d9"; // Darker blue
  },
  actionReset: (e) => {
    e.target.style.backgroundColor = colors.info;
  },
  danger: (e) => {
    e.target.style.backgroundColor = "#c82333"; // Darker red
  },
  dangerReset: (e) => {
    e.target.style.backgroundColor = colors.error;
  }
};

// Media queries 
export const breakpoints = {
  mobile: "480px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1200px"
};

// Helper for responsive design (to be used with conditional rendering)
export const getDeviceSize = () => {
  const width = window.innerWidth;
  if (width < parseInt(breakpoints.mobile)) return 'xs';
  if (width < parseInt(breakpoints.tablet)) return 'sm';
  if (width < parseInt(breakpoints.desktop)) return 'md';
  if (width < parseInt(breakpoints.wide)) return 'lg';
  return 'xl';
};

export default {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  layout,
  components,
  buttonHoverState,
  breakpoints,
  getDeviceSize
};
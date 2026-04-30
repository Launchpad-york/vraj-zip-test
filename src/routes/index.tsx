import { Navigate } from "react-router-dom";
import {
	ProtectedRoute,
	PublicRoute,
	SuperAdminRoute,
} from "@/components/common";
import { ROUTES } from "@/const";
import {
	AddCompanyPage,
	AddCorporationAdvancedSetupPage,
	AddCorporationQuickSetupPage,
	AddRolePage,
	ChatbotPage,
	ChooseSetupPage,
	CompanyDirectoryPage,
	CorporateDirectoryPage,
	DashboardPage,
	EditRolePage,
	ForgotPasswordPage,
	InvoiceManagementPage,
	LoginPage,
	RolesPermissionsPage,
	UserDirectoryPage,
	ViewCompanyPage,
	ViewCorporationPage,
} from "@/pages";
import type { RouteConfig } from "@/types";

export const routes: RouteConfig[] = [
	// Default redirect to login
	{
		path: "/",
		element: <Navigate to={ROUTES.auth.login} replace />,
	},
	// Public Auth routes - only accessible when not logged in
	{
		path: ROUTES.auth.login,
		element: (
			<PublicRoute>
				<LoginPage />
			</PublicRoute>
		),
	},
	{
		path: ROUTES.auth.forgotPassword,
		element: (
			<PublicRoute>
				<ForgotPasswordPage />
			</PublicRoute>
		),
	},
	// Protected Dashboard routes
	{
		path: ROUTES.dashboard.root,
		element: (
			<ProtectedRoute>
				<DashboardPage />
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.root,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<CorporateDirectoryPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.companyDirectory.root,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<CompanyDirectoryPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.companyDirectory.add,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCompanyPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.companyDirectory.addWithId,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCompanyPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.companyDirectory.view,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<ViewCompanyPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.view,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<ViewCorporationPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.chooseSetup,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<ChooseSetupPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.add,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCorporationQuickSetupPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.addWithId,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCorporationQuickSetupPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.addAdvanced,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCorporationAdvancedSetupPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.corporateDirectory.addAdvancedWithId,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddCorporationAdvancedSetupPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	//Chatbot Route
	{
		path: ROUTES.chatbot.root,
		element: (
			<ProtectedRoute>
				<ChatbotPage />
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.userDirectory.root,
		element: (
			<ProtectedRoute>
				<UserDirectoryPage />
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.roles.root,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<RolesPermissionsPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.roles.add,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<AddRolePage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.roles.edit,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<EditRolePage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
	{
		path: ROUTES.finance.invoices,
		element: (
			<ProtectedRoute>
				<SuperAdminRoute>
					<InvoiceManagementPage />
				</SuperAdminRoute>
			</ProtectedRoute>
		),
	},
];

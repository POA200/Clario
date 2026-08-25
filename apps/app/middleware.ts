import { withAuth } from "next-auth/middleware";

export default withAuth(() => undefined, {
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teams/:path*",
    "/tasks/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
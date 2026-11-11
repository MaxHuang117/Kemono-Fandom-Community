import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            // Discord envía `iss` en el callback (RFC 9207) y openid-client lo
            // valida contra `issuer`; sin esto falla con "issuer must be configured".
            issuer: "https://discord.com",
        }),
    ],

    pages: {
        signIn: "/login",
        error: "/",
    },

    callbacks: {
        async jwt({ token, profile }) {
            if (profile) {
                token.discordId = String(
                    (profile as { id?: string }).id
                );
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.discordId = token.discordId as string;
            }

            return session;
        },
    },
};
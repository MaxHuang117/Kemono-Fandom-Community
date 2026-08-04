import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({

    providers: [

        DiscordProvider({

            clientId: process.env.DISCORD_CLIENT_ID!,

            clientSecret: process.env.DISCORD_CLIENT_SECRET!,

        }),

    ],

        pages: {
        signIn: "/login",
        error: "/", // si cancela Discord vuelve al inicio
    },

    callbacks: {

        async jwt({ token, profile, account }) {

            if (profile) {

                token.discordId = String(
                    (profile as { id?: string }).id
                );

            }

            if (account?.access_token) {

                token.accessToken = account.access_token;

            }

            return token;

        },

        async session({ session, token }) {

            if (session.user) {

                session.user.discordId = token.discordId as string;

            }

            session.accessToken = token.accessToken as string;

            return session;

        },

            },

});

export { handler as GET, handler as POST };
import "dotenv/config"
import Koa from "koa"
import next from "next"
import logger from "koa-logger"
import createShopifyAuth from "@shopify/koa-shopify-auth"
import { verifyRequest } from "@shopify/koa-shopify-auth"
import session from "koa-session"

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env
console.log({ SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY })

app.prepare().then(() => {
  const handle = app.getRequestHandler()
  const server = new Koa()

  server.use(session({ secure: true, sameSite: "none" }, server))
  server.keys = [SHOPIFY_API_SECRET_KEY]

  server.use(logger())

  https: server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ["read_products"],

      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session
        ctx.redirect("/welcome")
      },
    })
  )

  server.use(
    verifyRequest({
      authRoute: "/auth",
      fallbackRoute: "/install",
    })
  )

  server.use(async (ctx) => {
    console.log("Next handling...")
    await handle(ctx.req, ctx.res)
    ctx.respond = false
    ctx.res.statusCode = 200
    return
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})

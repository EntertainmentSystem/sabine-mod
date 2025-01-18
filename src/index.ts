import "dotenv/config"
import { App } from "./structures"
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox"
import fastify from "fastify"
import { EmbedBuilder } from "./structures"
import { User, UserSchemaInterface } from "./database"
import { TextChannel } from "oceanic.js"

export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true
  }
});
client.start();
const cache = new Set<string>();
const webhook_route: FastifyPluginAsyncTypebox = async(fastify, opts) => {
  fastify.post("/webhook", {
    schema: {
      body: Type.Object({
        type: Type.String(),
        data: Type.Object({
          id: Type.String()
        })
      })
    }
  }, async(req, res) => {
    if(req.body.type === "payment") {
      const details = await fetch(
        `https://api.mercadopago.com/v1/payments/${req.body.data.id}`,
        {
          headers: {
            Authorization: "Bearer " + process.env.MP_TOKEN
          }
        }
      ).then(res => res.json());
      const args = details.external_reference.split(";");
      if(details.status === "approved" && !cache.has(details.external_reference)) {
        cache.add(details.external_reference);
        const user = (await User.findById(args[1]) || new User({ _id: args[1] })) as UserSchemaInterface;
        let keyId = await user.addPremium("BUY_PREMIUM");
        const embed = new EmbedBuilder()
        .setTitle("Pagamento aprovado")
        .setDesc(`Sua compra de **${details.transaction_details.total_paid_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}** foi aprovada e você já pode aproveitar seus benefícios!\n\nSua chave de ativação é \`${keyId}\`\nNão compartilhe com NINGUÉM!\n\nPara ativar sua chave, vá em https://canary.discord.com/channels/1233965003850125433/1313588710637568030 e use o comando \`${process.env.PREFIX}ativarchave <id do servidor>\``)
        .setFooter({ text: "O tópico será deletado automaticamente após 20 minutos de inatividade" });
        const channel = client.getChannel(args[0]) as TextChannel;
        if(channel) channel.createMessage(embed.build());
      }
      else if(details.status === "rejected") {
        const embed = new EmbedBuilder()
        .setTitle("Pagamento rejeitado")
        .setDesc(`Sua compra de **${details.transaction_details.total_paid_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}** foi rejeitada e não foi possível prosseguir com o pagamento!`)
        const channel = client.getChannel(args[0]) as TextChannel;
        if(channel) channel.createMessage(embed.build());
      }
    }
  });
}
const server = fastify();
server.register(webhook_route);
server.listen({ host: "0.0.0.0", port: 3000 });
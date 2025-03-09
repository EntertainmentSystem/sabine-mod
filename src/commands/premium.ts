import { createCommand, EmbedBuilder, SelectMenuBuilder } from "../structures"

export default createCommand({
  name: "premium",
  onlyDev: true,
  async run({ ctx }) {
    await ctx.message.delete();
    const menu = new SelectMenuBuilder()
    .setPlaceholder("Select a plan")
    .setOptions(
      {
        label: "Premium Booster",
        value: "premium_booster",
        description: "Get the Premium Booster just by boosting the server!"
      },
      {
        label: "Premium | Mercado Pago, Pix, cartão de crédito",
        value: "premium_br",
        description: "Compre o Premium por apenas R$5,99 durante 30 dias!"
      },
      {
        label: "Premium | PayPal",
        value: "premium_usd",
        description: "Buy Premium for just $2.99 for 30 days!"
      }
    )
    .setCustomId("premium")
    const embed = new EmbedBuilder()
    .setTitle("BECOME A PREMIUM USER")
    .setDesc("Use this panel to purchase one of our plans and gain exclusive advantages for your server!")
    .setFields(
      {
        name: "Premium Booster",
        value: "- Key Booster generated manually\n  - Can be activated on up to one server\n  - You can add up to 10 tournaments\n  - Lasts as long as the boost is active"
      },
      {
        name: "Premium",
        value: "- Key Premium generated automatically\n  - Can be activated on up to 2 different servers\n  - You can add up to 20 tournaments\n  - News feature released\n  - Feature to follow live matches released"
      },
      {
        name: "Payment methods",
        value: "- <:mercadopago:1313901326744293427> Mercado Pago\n- <:paypal:1313901126927650879> PayPal"
      }
    );
    ctx.send(menu.build(embed.build()));
  }
});

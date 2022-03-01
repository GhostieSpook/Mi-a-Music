const Command = require("../structures/command.js");
const { MessageEmbed }  = require('discord.js');
const generatePages = require('../utils/embedPages.js');

module.exports = new Command({
	name: "queue",
    aliases: ['q'],
	description: "Displays the server queue",
	permission: "SEND_MESSAGES",
	async run(message, args, client, slash, _fromButton = false) {
        const queue = client.player.getQueue(message.guild);
        if (!queue || !queue.current) {
            if(_fromButton) return;
            const embed = new MessageEmbed();
            embed.setTitle('Server Queue');
            embed.setColor('#b84e44');
            embed.setDescription(`No songs in the queue.`);
            return message.reply({ embeds: [embed] });
        }

        const pages = [];
        let page = 1, emptypage = false, usedby = _fromButton ? `[${message.member}]\n` : "";
        do {
            const pageStart = 10 * (page - 1);
            const pageEnd = pageStart + 10;
            const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
                return `**${i + pageStart + 1}**. [${m.title}](${m.url}) ${m.duration} - ${m.requestedBy}`;
            });
            if(tracks.length) {
                const embed = new MessageEmbed();
                embed.setDescription(`${usedby}${tracks.join('\n')}${
                    queue.tracks.length > pageEnd
                        ? `\n... ${queue.tracks.length - pageEnd} more track(s)`
                        : ''
                }`);
                if(page%2 === 0) embed.setColor('#b84e44');
                else embed.setColor('#44b868');
                if(page === 1) embed.setAuthor({ name: `Now playing: ${queue.current.title}`, iconURL: null, url: `${queue.current.url}` });
                pages.push(embed);
                page++;
            }
            else  {
                emptypage = true;
                if(page === 1) {
                    const embed = new MessageEmbed();
                    embed.setColor('#44b868');
                    embed.setDescription(`${usedby}No more songs in the queue.`);
                    embed.setAuthor({ name: `Now playing: ${queue.current.title}`, iconURL: null, url: `${queue.current.url}` });
                    return _fromButton ? message.channel.send({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }
                if(page === 2) {
                    return _fromButton ? message.channel.send({ embeds: [pages[0]] }) : message.reply({ embeds: [pages[0]] });
                }
            }
        } while(!emptypage);

        generatePages(message, pages, { timeout: 40000, fromButton: _fromButton } );
	}
});
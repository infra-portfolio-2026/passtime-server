import Ticket from "../../models/ticketModel.js";

export const getTicketList = async () => {
  const tickets = await Ticket.find();
  return tickets;
};

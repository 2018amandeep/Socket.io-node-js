import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {    // cors is a library that allows request ot come from another urls and it says where do you allow the request to come from so our servers are telling our clients that these urls are allowed in the same origin you came from
    //  It allows us to relax the security applied to an API. This is done by by passing the Access-Control-Allow-Origin headers, which specify which origins can access the API
    origin: '*',  //The code block below will ensure any page can access the ingredient resources. The Asterisk symbol will create the CORS header, and any origin can, therefore, get the response of this localhost server.
    // origin: ['https://www.section.io', 'https://www.google.com/'] we can also use different urls here if we have multiple origins
  }
})
export class MessagesGateway {   // It is like a controller which works with events instead of http
  @WebSocketServer()
    server: Server; //imported from socket io directly
  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')  // createMessage is a event which a clinet will send
  async create(@MessageBody() createMessageDto: CreateMessageDto) {  //MessageBody--->it will take payload from the clienr
    const message = await this.messagesService.create(createMessageDto);

    this.server.emit('message', message);   //it allows us to emit events to all connected clients
    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom( @MessageBody() name:string, @ConnectedSocket() client: Socket){ //ConnectedSocket is used if we want to know anything about client
    return this.messagesService.identify(name, client.id);
  }

  @SubscribeMessage('typing')
  async typing(@MessageBody('isTyping') isTyping:boolean, @ConnectedSocket() client:Socket) {
    //clients.broadcast sayas that we want to emit message to everyone expect the person who is typing
    const name = await this.messagesService.getClientName(client.id);

    client.broadcast.emit('typing', {name,isTyping})
  }

  // @SubscribeMessage('findOneMessage')
  // findOne(@MessageBody() id: number) {
  //   return this.messagesService.findOne(id);
  // }

  // @SubscribeMessage('updateMessage')
  // update(@MessageBody() updateMessageDto: UpdateMessageDto) {
  //   return this.messagesService.update(updateMessageDto.id, updateMessageDto);
  // }

  // @SubscribeMessage('removeMessage')
  // remove(@MessageBody() id: number) {
  //   return this.messagesService.remove(id);
  // }
}


//  nest install @nestjs/websockets @nestjs/platform-socket.io
//nest g resource messages
// npm i socket.io-client
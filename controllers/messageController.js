import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { getRecipientSocketId } from "../socket/socket.js";

// const sendMessage = async (req, res) => {
//   try {
//     const { recipientId, message } = req.body;

//     const senderId = req.user._id;

//     let conversation = await Conversation.findOne({
//       participants: { $all: [senderId, recipientId] },
//     });
//     // const {recipientId,message} = req.body;
//     // const senderId = req.user._id;

//     // let conversation = await Conversation.findOne({
//     //     participants : {$all  : [recipientId , senderId]}
//     // });

//     // if(!conversation){
//     //     conversation = new Conversation({
//     //         participants :  [senderId , recipientId],
//     //         lastMessage : {
//     //             text : message,
//     //             sender : senderId,
//     //         }
//     //     }),
//     //     await conversation.save();

//     //     const newMessage = new Message({
//     //         conversationId : conversation._id,
//     //         sender : senderId,
//     //         text : message,
//     //     })

//     //     await Promise.all([
//     //         newMessage.save(),
//     //         conversation.updateOne({
//     //             lastMessage : {
//     //                 text : message,
//     //                 sender : senderId,

//     //             }
//     //         })

//     //     ])
//     if (!conversation) {
//       conversation = new Conversation({
//         participants: [senderId, recipientId],
//         lastMessage: {
//           text: message,
//           sender: senderId,
//         },
//       });
//       await conversation.save();
//     }

//     // if (img) {
//     // 	const uploadedResponse = await cloudinary.uploader.upload(img);
//     // 	img = uploadedResponse.secure_url;
//     // }

//     const newMessage = new Message({
//       conversationId: conversation._id,
//       sender: senderId,
//       text: message,
//     });

//     await Promise.all([
//       newMessage.save(),
//       conversation.updateOne({
//         lastMessage: {
//           text: message,
//           sender: senderId,
//         },
//       }),
//     ]);

//     res.status(201).json(newMessage);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//     console.log(error);
//   }
// };

async function sendMessage(req, res) {
	try {
		const { recipientId, message } = req.body;
	
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

		if (!conversation) {
			conversation = new Conversation({
				participants: [senderId, recipientId],
				lastMessage: {
					text: message,
					sender: senderId,
				},
			});
			await conversation.save();
		}


		const newMessage = new Message({
			conversationId: conversation._id,
			sender: senderId,
			text: message,
			
		});

		await Promise.all([
			newMessage.save(),
			conversation.updateOne({
				lastMessage: {
					text: message,
					sender: senderId,
				},
			}),
		]);

		const recipientSocketId = getRecipientSocketId(recipientId);
		if(recipientSocketId){
			io.to(recipientSocketId).emit('getMessage' , newMessage);

		}
		

		

		res.status(201).json(newMessage);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const getMessages = async(req,res) => {
    const {otherUserId} = req.params;
        const userId = req.user._id; 
    try {
        const conversation = await Conversation.findOne({
            participants : {$all : [userId , otherUserId]}

        })
		if(!conversation){
			return res.status(404).json({error: "Conversation not found" })

		};

        const messages = await Message.find({conversationId : conversation._id}).sort({createdAt : 1});
		res.status(201).json(messages);
        
    } catch (error) {
        res.status(500).json({error : error.message})
        
    }
}

const getConversations = async (req,res) => {
	const userId = req.user._id
	try {
		const conversations = await Conversation.find({participants : userId}).populate({
			path : "participants",
			 select : "username profilePic",
		})

		// remove the user from conversation
		conversations.forEach(conversation => {
			conversation.participants = conversation.participants.filter(
				participant => participant._id.toString() !== userId.toString()
			)
		})
		res.status(201).json(conversations);
	} catch (error) {
		res.status(500).json({error : error.message});
		console.log(error)
		
	}

}





export { getMessages,  sendMessage , getConversations };




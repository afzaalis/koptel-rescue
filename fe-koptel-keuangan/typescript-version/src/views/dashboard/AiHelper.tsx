import { useState, useEffect, useRef, ChangeEvent } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from 'mdi-material-ui/Send';
import RobotOutline from 'mdi-material-ui/RobotOutline'; 
import AccountCircleOutline from 'mdi-material-ui/AccountCircleOutline'; 
import { styled, useTheme } from '@mui/material/styles';

// ** Axios for API calls
import axios from 'axios';

// ** Auth Config (untuk baseURL API)
import authConfig from 'src/configs/auth';

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 200px)', 
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

const MessageList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const MessageInputBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const UserMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: 'flex-end',
  '& .MuiListItemText-root': {
    textAlign: 'right',
  },
  '& .MuiListItemText-primary': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    maxWidth: '75%',
    wordBreak: 'break-word',
  },
}));

const AiMessage = styled(ListItem)(({ theme }) => ({
  justifyContent: 'flex-start',
  '& .MuiListItemText-root': {
    textAlign: 'left',
  },
  '& .MuiListItemText-primary': {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    maxWidth: '75%',
    wordBreak: 'break-word',
  },
}));

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const AiHelperChat = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMsg: Message = { text: inputMessage, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      if (!token) {
        // setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      const baseUrl = authConfig.meEndpoint.split('/api/auth')[0];

      const response = await axios.post(
        `${baseUrl}/api/ai-helper/chat`,
        { message: inputMessage },
        { headers }
      );

      const aiResponseText = response.data.response;
      const aiMsg: Message = { text: aiResponseText, sender: 'ai' };
      setMessages((prevMessages) => [...prevMessages, aiMsg]);
    } catch (error) {
      console.error('Error sending message to AI Helper:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Maaf, terjadi kesalahan. Silakan coba lagi.', sender: 'ai' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h5' sx={{ mb: 4 }}>
        AI Helper Koptel 🤖
      </Typography>
      <ChatContainer>
        <MessageList>
          {messages.length === 0 && !isLoading && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    Halo! Saya AI Helper Koptel. Bagaimana saya bisa membantu Anda hari ini?
                  </Typography>
                }
              />
            </ListItem>
          )}
          {messages.map((msg, index) => (
            msg.sender === 'user' ? (
              <UserMessage key={index}>
                <ListItemText primary={msg.text} />
                <AccountCircleOutline sx={{ ml: 1, color: theme.palette.primary.main }} />
              </UserMessage>
            ) : (
              <AiMessage key={index}>
                <RobotOutline sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <ListItemText primary={msg.text} />
              </AiMessage>
            )
          ))}
          {isLoading && (
            <ListItem>
              <RobotOutline sx={{ mr: 1, color: theme.palette.secondary.main }} />
              <ListItemText primary={<CircularProgress size={20} />} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </MessageList>
        <MessageInputBox>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Ketik pesan Anda...'
            value={inputMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ mr: 2 }}
          />
          <Button
            variant='contained'
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
          >
            Kirim
          </Button>
        </MessageInputBox>
      </ChatContainer>
    </Box>
  );
};

export default AiHelperChat;

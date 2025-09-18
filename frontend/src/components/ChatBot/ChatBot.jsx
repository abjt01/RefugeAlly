import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import ChatMessage from './ChatMessage';

const ChatBot = ({ triageResult }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (triageResult) {
      const botMessage = {
        text: triageResult.data?.advice,
        severity: triageResult.data?.severity,
        timestamp: triageResult.timestamp,
        isBot: true
      };
      const userMessage = triageResult.userInput
        ? {
            text: Array.isArray(triageResult.userInput.symptoms)
              ? triageResult.userInput.symptoms.join(', ')
              : triageResult.userInput.symptoms,
            timestamp: triageResult.timestamp,
            isBot: false
          }
        : null;
      if (userMessage) {
        setMessages(prev => [...prev, userMessage, botMessage]);
      } else {
        setMessages(prev => [...prev, botMessage]);
      }
    }
  }, [triageResult]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Card sx={{ maxWidth: 600, margin: '0 auto', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" textAlign="center" color="text.secondary">
            RefuGuardian AI is ready to help you
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
            Describe your symptoms above to get personalized health advice
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto', mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          Health Consultation
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, bgcolor: 'grey.50' }}>
          {messages.map((message, idx) => (
            <ChatMessage key={idx} message={message} isBot={message.isBot} />
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatBot;

import { WhatsApp } from '@core/whatsapp';
import { ComponentTypesEnum, InteractiveTypesEnum, LanguagesEnum } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactObject, InteractiveObject, MessageRequestParams, MessageTemplateObject } from '../types';

describe('Messages API - Unit Tests', () => {
    let whatsApp: WhatsApp;
    let mockRequestSend: any;

    beforeEach(() => {
        whatsApp = new WhatsApp({
            accessToken: process.env.CLOUD_API_ACCESS_TOKEN || 'test_token',
            businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || 'test_business_id',
            phoneNumberId: Number(process.env.WA_PHONE_NUMBER_ID) || 123456789,
        });

        mockRequestSend = vi.spyOn(whatsApp.requester, 'getJson');
        mockRequestSend.mockResolvedValue({
            contacts: [{ input: '1234567890', wa_id: '1234567890' }],
            messages: [{ id: 'msg_test_123' }],
            messaging_product: 'whatsapp',
        });
    });

    describe('Message Type Validation', () => {
        it('should send image message with correct schema', async () => {
            const imageParams = {
                body: {
                    caption: 'Test image',
                    id: 'image_media_123',
                },
                to: '1234567890',
            };

            await whatsApp.messages.image(imageParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                image: {
                    caption: 'Test image',
                    id: 'image_media_123',
                },
                to: '1234567890',
                type: 'image',
            });
        });

        it('should send text message with correct schema', async () => {
            const textParams = {
                body: 'Hello, World!',
                to: '1234567890',
            };

            await whatsApp.messages.text(textParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                text: {
                    body: 'Hello, World!',
                },
                to: '1234567890',
                type: 'text',
            });
        });

        it('should send video message with correct schema', async () => {
            const videoParams = {
                body: {
                    caption: 'Test video',
                    id: 'video_media_123',
                },
                to: '1234567890',
            };

            await whatsApp.messages.video(videoParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                to: '1234567890',
                type: 'video',
                video: {
                    caption: 'Test video',
                    id: 'video_media_123',
                },
            });
        });

        it('should send audio message with correct schema', async () => {
            const audioParams = {
                body: {
                    id: 'audio_media_123',
                },
                to: '1234567890',
            };

            await whatsApp.messages.audio(audioParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                audio: {
                    id: 'audio_media_123',
                },
                to: '1234567890',
                type: 'audio',
            });
        });

        it('should send document message with correct schema', async () => {
            const documentParams = {
                body: {
                    caption: 'Test document',
                    filename: 'test.pdf',
                    id: 'document_media_123',
                },
                to: '1234567890',
            };

            await whatsApp.messages.document(documentParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                document: {
                    caption: 'Test document',
                    filename: 'test.pdf',
                    id: 'document_media_123',
                },
                to: '1234567890',
                type: 'document',
            });
        });

        it('should send sticker message with correct schema', async () => {
            const stickerParams = {
                body: {
                    id: 'sticker_media_123',
                },
                to: '1234567890',
            };

            await whatsApp.messages.sticker(stickerParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                sticker: {
                    id: 'sticker_media_123',
                },
                to: '1234567890',
                type: 'sticker',
            });
        });

        it('should send location message with correct schema', async () => {
            const locationParams = {
                body: {
                    address: 'Seoul, South Korea',
                    latitude: 37.5665,
                    longitude: 126.978,
                    name: 'Seoul',
                },
                to: '1234567890',
            };

            await whatsApp.messages.location(locationParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                location: {
                    address: 'Seoul, South Korea',
                    latitude: 37.5665,
                    longitude: 126.978,
                    name: 'Seoul',
                },
                to: '1234567890',
                type: 'location',
            });
        });

        it('should send contacts message with correct schema', async () => {
            const contactsParams: MessageRequestParams<[ContactObject]> = {
                body: [
                    {
                        name: {
                            first_name: 'John',
                            formatted_name: 'John Doe',
                            last_name: 'Doe',
                        },
                        phones: [
                            {
                                phone: 'PHONE_NUMBER',
                                type: 'WORK',
                            },
                        ],
                    },
                ],
                to: '1234567890',
            };

            await whatsApp.messages.contacts(contactsParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                contacts: [
                    {
                        name: {
                            first_name: 'John',
                            formatted_name: 'John Doe',
                            last_name: 'Doe',
                        },
                        phones: [
                            {
                                phone: 'PHONE_NUMBER',
                                type: 'WORK',
                            },
                        ],
                    },
                ],
                to: '1234567890',
                type: 'contacts',
            });
        });

        it('should send interactive button message with correct schema', async () => {
            const interactiveParams: MessageRequestParams<InteractiveObject> = {
                body: {
                    action: {
                        buttons: [
                            {
                                reply: {
                                    id: 'btn_1',
                                    title: 'Button 1',
                                },
                                type: 'reply',
                            },
                        ],
                    },
                    body: {
                        text: 'Choose an option:',
                    },
                    header: {
                        text: 'Header Text',
                        type: 'text',
                    },
                    type: InteractiveTypesEnum.Button,
                },
                to: '1234567890',
            };

            await whatsApp.messages.interactive(interactiveParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                interactive: {
                    action: {
                        buttons: [
                            {
                                reply: {
                                    id: 'btn_1',
                                    title: 'Button 1',
                                },
                                type: 'reply',
                            },
                        ],
                    },
                    body: {
                        text: 'Choose an option:',
                    },
                    header: {
                        text: 'Header Text',
                        type: 'text',
                    },
                    type: 'button',
                },
                to: '1234567890',
                type: 'interactive',
            });
        });

        it('should send template message with correct schema', async () => {
            const templateParams: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>> = {
                body: {
                    components: [],
                    language: {
                        code: LanguagesEnum.English,
                        policy: 'deterministic' as const,
                    },
                    name: 'hello_world',
                },
                to: '1234567890',
            };

            await whatsApp.messages.template(templateParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                template: {
                    language: {
                        code: LanguagesEnum.English,
                    },
                    name: 'hello_world',
                },
                to: '1234567890',
                type: 'template',
            });
        });
    });

    describe('Message Status Operations', () => {
        it('should mark message as read with correct schema', async () => {
            const statusParams = {
                messageId: 'msg_test_123',
                status: 'read',
            };

            await whatsApp.messages.status(statusParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                message_id: 'msg_test_123',
                messaging_product: 'whatsapp',
                status: 'read',
            });
        });

        it('should show typing indicator with correct schema', async () => {
            const typingParams = {
                messageId: 'msg_test_123',
            };

            await whatsApp.messages.showTypingIndicator(typingParams);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                message_id: 'msg_test_123',
                messaging_product: 'whatsapp',
                status: 'read',
            });
        });
    });
});

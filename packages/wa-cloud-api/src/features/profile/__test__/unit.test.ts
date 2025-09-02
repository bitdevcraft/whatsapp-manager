import { WhatsApp } from '@core/whatsapp';
import { BusinessVerticalEnum } from '@shared/types/enums';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateBusinessProfileRequest } from '../types';

describe('Business Profile API - Unit Tests', () => {
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
            success: true,
        });
    });

    describe('Business Profile Management', () => {
        it('should get business profile with all fields', async () => {
            mockRequestSend.mockResolvedValue({
                data: [
                    {
                        about: 'We provide excellent service',
                        address: '123 Business St, City, State',
                        description: 'A comprehensive business description',
                        email: 'contact@example.com',
                        messaging_product: 'whatsapp',
                        profile_picture_url: 'https://example.com/profile.jpg',
                        vertical: BusinessVerticalEnum.RETAIL,
                        websites: ['https://example.com'],
                    },
                ],
            });

            const profile = await whatsApp.businessProfile.getBusinessProfile();

            expect(mockRequestSend).toHaveBeenCalled();
            expect(profile.data).toHaveLength(1);
            expect(profile.data[0]).toMatchObject({
                about: 'We provide excellent service',
                email: 'contact@example.com',
                messaging_product: 'whatsapp',
                vertical: BusinessVerticalEnum.RETAIL,
            });
        });

        it('should get business profile with specific fields', async () => {
            mockRequestSend.mockResolvedValue({
                data: [
                    {
                        about: 'We provide excellent service',
                        email: 'contact@example.com',
                    },
                ],
            });

            const profile = await whatsApp.businessProfile.getBusinessProfile(['about', 'email']);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain('fields=about,email');
        });

        it('should get business profile with fields as string', async () => {
            mockRequestSend.mockResolvedValue({
                data: [
                    {
                        about: 'We provide excellent service',
                        address: '123 Business St',
                    },
                ],
            });

            const profile = await whatsApp.businessProfile.getBusinessProfile('about,address');

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain('fields=about,address');
        });

        it('should update business profile with correct schema', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Updated business description',
                address: '456 New Address Ave',
                description: 'A new comprehensive description',
                email: 'newemail@example.com',
                messaging_product: 'whatsapp',
                vertical: BusinessVerticalEnum.RESTAURANT,
                websites: ['https://newwebsite.com'],
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                about: 'Updated business description',
                address: '456 New Address Ave',
                description: 'A new comprehensive description',
                email: 'newemail@example.com',
                messaging_product: 'whatsapp',
                vertical: BusinessVerticalEnum.RESTAURANT,
                websites: ['https://newwebsite.com'],
            });
        });

        it('should update business profile with minimal fields', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Just about text',
                messaging_product: 'whatsapp',
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];

            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                about: 'Just about text',
                messaging_product: 'whatsapp',
            });
        });
    });

    describe('Profile Picture Upload Process', () => {
        it('should create upload session with correct parameters', async () => {
            mockRequestSend.mockResolvedValue({
                id: 'upload_session_123',
            });

            const fileLength = 1024000; // 1MB
            const fileType = 'image/jpeg';
            const fileName = 'profile.jpg';

            const session = await whatsApp.businessProfile.createUploadSession(fileLength, fileType, fileName);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toContain('file_length=1024000');
            expect(endpoint).toContain('file_type=image%2Fjpeg');
            expect(endpoint).toContain('file_name=profile.jpg');
            expect(session.id).toBe('upload_session_123');
        });

        it('should upload media to session', async () => {
            mockRequestSend.mockResolvedValue({
                h: 'handle_123',
            });

            const uploadId = 'upload_session_123';
            const fileBuffer = Buffer.from('fake image data');

            const response = await whatsApp.businessProfile.uploadMedia(uploadId, fileBuffer);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint, __, body] = mockRequestSend.mock.calls[0];
            expect(endpoint).toBe(uploadId);
            expect(body).toBe(fileBuffer);
            expect(response.h).toBe('handle_123');
        });

        it('should get upload handle information', async () => {
            mockRequestSend.mockResolvedValue({
                file_size: 1024000,
                handle: 'final_handle_123',
                upload_result: {
                    handle_type: 'image',
                    name: 'profile.jpg',
                },
            });

            const uploadId = 'upload_session_123';

            const handleInfo = await whatsApp.businessProfile.getUploadHandle(uploadId);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, endpoint] = mockRequestSend.mock.calls[0];
            expect(endpoint).toBe(uploadId);
            expect(handleInfo).toMatchObject({
                file_size: 1024000,
                handle: 'final_handle_123',
                upload_result: {
                    handle_type: 'image',
                    name: 'profile.jpg',
                },
            });
        });

        it('should complete full profile picture upload workflow', async () => {
            // Mock the three-step process
            const createSessionMock = vi.fn().mockResolvedValue({ id: 'session_123' });
            const uploadMediaMock = vi.fn().mockResolvedValue({ h: 'temp_handle' });
            const getHandleMock = vi.fn().mockResolvedValue({
                file_size: 1024000,
                handle: 'final_handle_123',
                upload_result: { handle_type: 'image', name: 'profile.jpg' },
            });
            const updateProfileMock = vi.fn().mockResolvedValue({ success: true });

            whatsApp.businessProfile.createUploadSession = createSessionMock;
            whatsApp.businessProfile.uploadMedia = uploadMediaMock;
            whatsApp.businessProfile.getUploadHandle = getHandleMock;
            whatsApp.businessProfile.updateBusinessProfile = updateProfileMock;

            const fileBuffer = Buffer.from('fake image data');
            const fileLength = fileBuffer.length;
            const fileType = 'image/jpeg';
            const fileName = 'profile.jpg';

            // Step 1: Create upload session
            const session = await whatsApp.businessProfile.createUploadSession(fileLength, fileType, fileName);
            expect(createSessionMock).toHaveBeenCalledWith(fileLength, fileType, fileName);
            expect(session.id).toBe('session_123');

            // Step 2: Upload the image data
            const uploadResponse = await whatsApp.businessProfile.uploadMedia(session.id, fileBuffer);
            expect(uploadMediaMock).toHaveBeenCalledWith(session.id, fileBuffer);
            expect(uploadResponse.h).toBe('temp_handle');

            // Step 3: Get the handle for the uploaded file
            const handleInfo = await whatsApp.businessProfile.getUploadHandle(session.id);
            expect(getHandleMock).toHaveBeenCalledWith(session.id);
            expect(handleInfo.handle).toBe('final_handle_123');

            // Step 4: Update profile with new picture
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Business with new profile picture',
                messaging_product: 'whatsapp',
                profile_picture_handle: handleInfo.handle,
            };

            const updateResponse = await whatsApp.businessProfile.updateBusinessProfile(updateRequest);
            expect(updateProfileMock).toHaveBeenCalledWith(updateRequest);
            expect(updateResponse.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockRequestSend.mockRejectedValue(new Error('API Error: Invalid request'));

            await expect(whatsApp.businessProfile.getBusinessProfile()).rejects.toThrow('API Error: Invalid request');
        });

        it('should handle upload session creation errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Upload session creation failed'));

            await expect(whatsApp.businessProfile.createUploadSession(1024, 'image/jpeg', 'test.jpg')).rejects.toThrow(
                'Upload session creation failed',
            );
        });

        it('should handle media upload errors', async () => {
            mockRequestSend.mockRejectedValue(new Error('Media upload failed'));

            const fileBuffer = Buffer.from('test data');
            await expect(whatsApp.businessProfile.uploadMedia('session_123', fileBuffer)).rejects.toThrow(
                'Media upload failed',
            );
        });
    });

    describe('Input Validation', () => {
        it('should handle empty update request', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                messaging_product: 'whatsapp',
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody).toMatchObject({
                messaging_product: 'whatsapp',
            });
        });

        it('should handle business vertical enum correctly', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Healthcare business',
                messaging_product: 'whatsapp',
                vertical: BusinessVerticalEnum.HEALTH,
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody.vertical).toBe(BusinessVerticalEnum.HEALTH);
        });

        it('should handle custom vertical string correctly', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Custom business type',
                messaging_product: 'whatsapp',
                vertical: 'CUSTOM_BUSINESS_TYPE',
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody.vertical).toBe('CUSTOM_BUSINESS_TYPE');
        });

        it('should handle multiple websites correctly', async () => {
            const updateRequest: UpdateBusinessProfileRequest = {
                about: 'Business with multiple websites',
                messaging_product: 'whatsapp',
                websites: ['https://main-site.com', 'https://shop.com'],
            };

            await whatsApp.businessProfile.updateBusinessProfile(updateRequest);

            expect(mockRequestSend).toHaveBeenCalled();
            const [_, __, ___, body] = mockRequestSend.mock.calls[0];
            const requestBody = JSON.parse(body);

            expect(requestBody.websites).toEqual(['https://main-site.com', 'https://shop.com']);
        });
    });
});

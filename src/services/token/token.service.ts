import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import Token from '../../models/token.model';
import { Op } from 'sequelize';
import { TokenType, IToken } from '../../types/token';
import {JWT_ACCESS_TOKEN_SECRET} from '../../config/'

// Define decoded token interface
interface DecodedToken {
  user_id: number;
  email: string;
  iat?: number;
  exp?: number;
}

class TokenService {
  private static instance: TokenService;
  private readonly secret: string;
  private readonly accessTokenExpiry: string = '15m';
  private readonly refreshTokenExpiry: string = '7d';

  private constructor() {
    const secret = JWT_ACCESS_TOKEN_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    this.secret = secret;
  }

  /**
   * Generates an access token for a user
   * @param user The user to generate a token for
   * @returns A promise that resolves to the generated token
   */
  public async generateToken(user: User): Promise<string> {
    if (!user?.id || !user?.email) {
      throw new Error('Invalid user data for token generation');
    }

    const payload = { user_id: user.id, email: user.email };
    // Fix the typing issue with jwt.sign
    return jwt.sign(payload, this.secret, { expiresIn: '15m' });
  }

  /**
   * Generates a refresh token for a user
   * @param user The user to generate a refresh token for
   * @returns A promise that resolves to an object containing the token and expiry date
   */
  public async generateRefreshToken(user: User): Promise<{ token: string; expires: Date }> {
    if (!user?.id || !user?.email) {
      throw new Error('Invalid user data for refresh token generation');
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days from now

    const payload = { user_id: user.id, email: user.email };
    // Fix the typing issue with jwt.sign
    const token = jwt.sign(payload, this.secret, { expiresIn:  '7d'});

    return {
      token,
      expires
    };
  }

  /**
   * Verifies a JWT token
   * @param token The token to verify
   * @returns A promise that resolves to the decoded token or null if invalid
   */
  public async verifyToken(token: string): Promise<DecodedToken | null> {
    try {
      // Fix the typing issue with jwt.verify
      const decoded = jwt.verify(token, this.secret) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refreshes an access token using a valid refresh token
   * @param refreshToken The refresh token to use
   * @returns A promise that resolves to a new access token or null if the refresh token is invalid
   */
  public async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      // First try to verify the JWT without database check
      // This is fast and will catch expired/invalid tokens immediately
      let decoded: DecodedToken;
      try {
        decoded =  jwt.verify(refreshToken, this.secret) as DecodedToken;
        
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError);
        return null;
      }
      
      // Only if JWT verification passes, check the database
      // This reduces unnecessary database queries for invalid tokens
      const tokenRecord = await this.getRefreshToken(refreshToken);
      if (!tokenRecord) {
        console.log("Token not found in database or revoked");
        return null;
      }
      
      // Create payload with required properties
      const payload = {
        user_id: decoded.user_id,
        email: decoded.email
      };
      
      // Generate new access token
      return jwt.sign(payload, this.secret, { expiresIn: '15m' });
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  /**
   * Saves a refresh token to the database
   * @param token The token object containing the token string and expiry
   * @param user The user the token belongs to
   * @returns A promise that resolves to the saved token record
   */
  public async saveToken(
    token: { token: string; expires: Date }, 
    user: User
  ): Promise<Token> {
    try {
      // Match the IToken interface requirements
      const tokenData: Omit<IToken, "id"> = {
        token: token.token,
        user_id: user.id,
        is_revoked: false,
        type: TokenType.REFRESH,
        expires: token.expires,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      return await Token.create(tokenData);
    } catch (error) {
      throw new Error(`Failed to save token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revokes all tokens for a user
   * @param user The user whose tokens should be revoked
   * @returns A promise that resolves to the number of tokens updated
   */
  public async revokeAllUserTokens(user: User): Promise<[number, Token[]]> {
    try {
      return await Token.update(
        { is_revoked: true }, 
        { 
          where: { user_id: user.id },
          returning: true
        }
      );
    } catch (error) {
      throw new Error(`Failed to revoke user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revokes a specific token
   * @param token The token string to revoke
   * @returns A promise that resolves to the number of tokens updated
   */
  public async revokeToken(token: string): Promise<[number, Token[]]> {
    try {
      return await Token.update(
        { is_revoked: true }, 
        { 
          where: { token },
          returning: true
        }
      );
    } catch (error) {
      throw new Error(`Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds a valid refresh token in the database
   * @param token The token string to find
   * @returns A promise that resolves to the token record or null if not found
   */
  public async getRefreshToken(token: string): Promise<Token | null> {
    try {
      return await Token.findOne({
        where: {
          token,
          is_revoked: false,
          expires: {
            [Op.gt]: new Date(),
          }
        }
      });
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Cleans up expired tokens from the database
   * @returns A promise that resolves to the number of tokens deleted
   */
  public async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await Token.destroy({
        where: {
          [Op.or]: [
            { expires: { [Op.lt]: new Date() } },
            { is_revoked: true }
          ]
        }
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to clean up expired tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the singleton instance of TokenService
   * @returns The TokenService instance
   */
  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }
}

export default TokenService;
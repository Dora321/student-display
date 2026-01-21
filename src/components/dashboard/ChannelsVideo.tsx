import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Play, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChannelsVideoProps {
  title?: string;
  description?: string;
  videoUrl?: string; // Direct .mp4 link
  channelsId?: string; // WeChat Channels ID/Link
  thumbnail?: string;
}

export const ChannelsVideo: React.FC<ChannelsVideoProps> = ({
  title = "精彩瞬间",
  description = "扫码查看视频号精彩内容",
  videoUrl,
  channelsId = "finder_id", // Placeholder
  thumbnail = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card overflow-hidden flex flex-col h-full bg-gradient-to-br from-white/40 to-white/10"
    >
      <div className="relative aspect-video overflow-hidden">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            className="w-full h-full object-cover" 
            controls 
            poster={thumbnail}
          />
        ) : (
          <div className="w-full h-full relative group">
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
                <Play className="w-8 h-8 fill-current" />
              </div>
            </div>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-brand-slate mb-1 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-orange rounded-full" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex-1">
             <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
               <QrCode className="w-3 h-3" />
               微信扫码观看
             </div>
             <div className="flex gap-2">
               <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 border-brand-blue/20 hover:bg-brand-blue/5 text-brand-blue"
                onClick={() => window.open(`https://weixin.qq.com/`, '_blank')}
               >
                 <ExternalLink className="w-3 h-3 mr-1" />
                 更多视频
               </Button>
             </div>
          </div>
          
          <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-inner border border-gray-100 flex items-center justify-center relative group cursor-help">
            <QrCode className="w-full h-full text-gray-800" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              长按或扫码进入视频号
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

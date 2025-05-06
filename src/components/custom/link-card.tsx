import { ExternalLink, Video, Youtube } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { use, useEffect, useState } from "react";

import Link from "next/link";

function LinkCard({ data }: { data: { id: number; created_at: string; link: string; category: string | null, title: string | null, image: string | null, desc: string | null } }) {
  const formattedDate = new Date(data.created_at).toLocaleDateString("id-ID", {
    year: "numeric", 
    month: "long",
    day: "numeric",
  });


  const getLinkIcon = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return <Youtube className="h-5 w-5 text-red-500" />;
    } else if (url.includes("tiktok.com")) {
      return <Video className="h-5 w-5 text-blue-400" />;
    } else {
      return <ExternalLink className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDomainName = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch (e) {
      return url;
    }
  };


  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="mt-1">
          <div className="w-16 h-16 overflow-hidden rounded">
            <img src={data.image} alt="preview"
                className="w-full h-full object-cover" />
          </div>
          </div>
          <div className="overflow-hidden">
            <Link
              href={data.link}
              target="_blank"
              className="text-blue-600 hover:underline font-medium break-all line-clamp-2"
            >
              {data.title ?? getDomainName(data.link)}
            </Link>
            <p className="text-sm text-gray-500 mt-1 truncate">{data.link}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">Added on {formattedDate}</CardFooter>
    </Card>
  );
}

export default LinkCard;
